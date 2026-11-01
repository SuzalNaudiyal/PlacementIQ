import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  BarChart3,
  RefreshCw,
  Award,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import {
  evaluatePlacement,
  simulateWhatIfScenario,
  getModelInformation,
} from '../../services/prediction';
import type {
  PredictionResponse,
  SimulationResponse,
  ModelInfoResponse,
  SimulationRequest,
} from '../../types/prediction';

export const PredictionDashboard: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // What-If Simulator state
  const [simForm, setSimForm] = useState<SimulationRequest>({
    cgpa: 8.0,
    backlogs: 0,
    coding_score: 85,
    aptitude_score: 80,
    internships_count: 1,
    projects_count: 2,
  });
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [showModelDetails, setShowModelDetails] = useState<boolean>(false);

  useEffect(() => {
    loadPredictionData();
  }, []);

  const loadPredictionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [predData, modelData] = await Promise.all([
        evaluatePlacement(),
        getModelInformation(),
      ]);
      setPrediction(predData);
      setModelInfo(modelData);

      // Seed simulator sliders from candidate's actual profile features
      if (predData.raw_features) {
        setSimForm({
          cgpa: predData.raw_features.cgpa || 7.5,
          backlogs: predData.raw_features.backlogs || 0,
          coding_score: predData.raw_features.coding_score || 75,
          aptitude_score: predData.raw_features.aptitude_score || 75,
          internships_count: predData.raw_features.internships_count || 1,
          projects_count: predData.raw_features.projects_count || 2,
        });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(errorObj.response?.data?.detail || errorObj.message || 'Failed to load placement prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const result = await simulateWhatIfScenario(simForm);
      setSimulationResult(result);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
      console.error('Simulation error:', errorObj);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm">Evaluating placement readiness with ML engine...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-8 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-400 text-center max-w-xl mx-auto">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
        <h3 className="font-semibold text-white mb-1">Prediction Unavailable</h3>
        <p className="text-xs text-red-300">{error || 'Unable to generate placement score.'}</p>
        <button
          onClick={loadPredictionData}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
        >
          Retry Prediction
        </button>
      </div>
    );
  }

  const probPercent = prediction.placement_percentage;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Prediction Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          {/* Circular Gauge / Probability */}
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:col-span-2">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    probPercent >= 80
                      ? 'text-emerald-400'
                      : probPercent >= 55
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  } transition-all duration-1000 ease-out`}
                  strokeDasharray={`${probPercent}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">{probPercent}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Likelihood</span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {prediction.readiness_status}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Placement Readiness Intelligence
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                Evaluated across 18 academic, coding, aptitude, project, and backlog signals via{' '}
                <span className="text-indigo-400 font-semibold">{prediction.model_used}</span>.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <span className="text-xs text-slate-400 font-medium">Model Accuracy:</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{(prediction.model_accuracy * 100).toFixed(1)}%</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-medium">ROC-AUC:</span>
                <span className="text-xs font-bold font-mono text-indigo-400">{prediction.model_roc_auc.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Predicted Package Band Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Salary Band</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>

            <div className="text-lg font-bold text-white bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {prediction.predicted_salary_tier}
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Projected annual compensation band based on current algorithmic problem solving and project depth.
            </p>

            <button
              onClick={loadPredictionData}
              className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-evaluate Profile
            </button>
          </div>
        </div>
      </div>

      {/* Explainable AI Factors (SHAP Insights) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Factors */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Top Positive Catalysts</h2>
              <p className="text-xs text-slate-400">Factors giving you an edge in campus recruitment</p>
            </div>
          </div>

          <div className="space-y-3">
            {prediction.top_positive_factors.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-3.5 space-y-1 hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">{item.factor}</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
            {prediction.top_positive_factors.length === 0 && (
              <p className="text-xs text-slate-500 italic p-3">No strong positive catalysts detected. Update your profile with projects and assessment scores.</p>
            )}
          </div>
        </div>

        {/* Risk Factors & Disqualifiers */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Placement Risk Drivers</h2>
              <p className="text-xs text-slate-400">Vulnerabilities lowering your selection odds</p>
            </div>
          </div>

          <div className="space-y-3">
            {prediction.top_risk_factors.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-3.5 space-y-1 hover:border-rose-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">{item.factor}</span>
                  <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
            {prediction.top_risk_factors.length === 0 && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero high-risk disqualifiers identified! Your academic profile meets all primary shortlisting criteria.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Next-Step Recommendations */}
      {prediction.recommendations.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Actionable Placement Remediation Plan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {prediction.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed"
              >
                <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive What-If Scenario Simulator */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Interactive "What-If" Placement Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate hypothetical candidate improvements (e.g., clearing backlogs or raising coding assessment) and see real-time probability impact.
            </p>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {simulating ? 'Calculating Delta...' : 'Simulate Scenario'}
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {/* Coding Score */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Coding Score</span>
              <span className="font-mono font-bold text-indigo-400">{simForm.coding_score}/100</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={simForm.coding_score}
              onChange={(e) => setSimForm({ ...simForm, coding_score: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Aptitude Score */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Aptitude Score</span>
              <span className="font-mono font-bold text-teal-400">{simForm.aptitude_score}/100</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={simForm.aptitude_score}
              onChange={(e) => setSimForm({ ...simForm, aptitude_score: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-teal-500"
            />
          </div>

          {/* Cumulative CGPA */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Target CGPA</span>
              <span className="font-mono font-bold text-emerald-400">{simForm.cgpa}</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.1"
              value={simForm.cgpa}
              onChange={(e) => setSimForm({ ...simForm, cgpa: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Active Backlogs */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Active Backlogs</span>
              <span className={`font-mono font-bold ${simForm.backlogs! > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simForm.backlogs}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={simForm.backlogs}
              onChange={(e) => setSimForm({ ...simForm, backlogs: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-rose-500"
            />
          </div>

          {/* Internships Count */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Internships</span>
              <span className="font-mono font-bold text-purple-400">{simForm.internships_count}</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={simForm.internships_count}
              onChange={(e) => setSimForm({ ...simForm, internships_count: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-purple-500"
            />
          </div>

          {/* Projects Count */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Projects</span>
              <span className="font-mono font-bold text-amber-400">{simForm.projects_count}</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={simForm.projects_count}
              onChange={(e) => setSimForm({ ...simForm, projects_count: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Baseline Likelihood</span>
                  <span className="text-xl font-bold text-slate-300 font-mono">
                    {simulationResult.baseline_percentage}%
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-600" />

                <div>
                  <span className="text-xs text-slate-400 block">Simulated Likelihood</span>
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {simulationResult.simulated_percentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-xl font-bold font-mono text-sm flex items-center gap-1.5 ${
                    simulationResult.net_gain_percent >= 0
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {simulationResult.net_gain_percent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {simulationResult.net_gain_percent >= 0 ? `+${simulationResult.net_gain_percent}% Net Gain` : `${simulationResult.net_gain_percent}% Impact`}
                </span>

                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
                  {simulationResult.simulated_salary_tier}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Simulation Key Findings:</h4>
              <ul className="space-y-1.5">
                {simulationResult.key_improvements.map((imp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Model Governance & Multi-Model Benchmark Inspector */}
      {modelInfo && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Academic Model Governance & Benchmark Comparison</h3>
                <p className="text-xs text-slate-400">Audited performance metrics across candidate ML algorithms (80/20 Test Split)</p>
              </div>
            </div>

            <button
              onClick={() => setShowModelDetails(!showModelDetails)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              {showModelDetails ? 'Hide Details ▲' : 'Inspect Benchmarks ▼'}
            </button>
          </div>

          {showModelDetails && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-3 font-semibold">Model Algorithm</th>
                      <th className="py-2 px-3 font-semibold">Accuracy</th>
                      <th className="py-2 px-3 font-semibold">Precision</th>
                      <th className="py-2 px-3 font-semibold">Recall</th>
                      <th className="py-2 px-3 font-semibold">F1-Score</th>
                      <th className="py-2 px-3 font-semibold">ROC-AUC</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {Object.entries(modelInfo.model_comparison).map(([name, m]) => {
                      const isSelected = name === modelInfo.best_model_name;
                      return (
                        <tr key={name} className={isSelected ? 'bg-indigo-950/30 text-white font-semibold' : 'text-slate-300'}>
                          <td className="py-2.5 px-3 font-sans flex items-center gap-2">
                            {isSelected && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            {name}
                          </td>
                          <td className="py-2.5 px-3">{(m.accuracy * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3">{(m.precision * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3">{(m.recall * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3">{(m.f1_score * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3">{m.roc_auc.toFixed(3)}</td>
                          <td className="py-2.5 px-3 font-sans">
                            {isSelected ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Deployed
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Benchmarked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Feature Importance Distribution */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Global Feature Importance (Permutation / MDI Weights):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(modelInfo.feature_importances)
                    .slice(0, 8)
                    .map(([fname, weight]) => (
                      <div key={fname} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono text-slate-300">{fname}</span>
                          <span className="font-mono font-bold text-indigo-400">{(weight * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, weight * 100 * 2.5)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
