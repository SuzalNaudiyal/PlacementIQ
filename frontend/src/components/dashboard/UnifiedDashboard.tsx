import { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Sparkles,
  Zap,
  FileText,
  Target,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Award,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard';
import type { DashboardSummaryResponse } from '../../types/dashboard';

interface UnifiedDashboardProps {
  onNavigate: (
    view: 'profile' | 'prediction' | 'resume' | 'skillgap' | 'jobs' | 'roadmap' | 'interview'
  ) => void;
}

export function UnifiedDashboard({ onNavigate }: UnifiedDashboardProps) {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'radar' | 'bar'>('radar');

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard summary:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch executive telemetry.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white">Synthesizing Career Intelligence Telemetry...</h3>
        <p className="text-sm text-slate-400 mt-1">
          Aggregating ML predictions, SHAP attribution, ATS metrics, role gaps, and radar benchmarks.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-slate-900/60 rounded-3xl border border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Dashboard Telemetry Unavailable</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {error || 'Please complete your student profile details first.'}
        </p>
        <button
          onClick={() => onNavigate('profile')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Complete Student Profile
        </button>
      </div>
    );
  }

  const { kpis, radar_benchmarks } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Welcome Hero */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-purple-950/20 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Phase 10: Unified Career Intelligence Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Placement Readiness & Intelligence Command
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time executive overview for <strong className="text-white">{data.student_name}</strong> ({data.branch}, CGPA: {data.cgpa}). Track placement probability, ATS resume health, 3-tier role fit, and 8-week sprint progress in one consolidated hub.
            </p>
          </div>

          {/* Quick Profile Completeness Widget */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center gap-4 flex-shrink-0 self-start lg:self-auto">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Profile Completeness</span>
              <span className="text-xl font-black text-white font-mono">
                {kpis.profile_completeness}%
              </span>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Edit Profile"
            >
              Update
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: ML Placement Likelihood */}
        <div
          onClick={() => onNavigate('prediction')}
          className="p-5 bg-slate-900/60 rounded-3xl border border-indigo-500/30 hover:border-indigo-400 transition cursor-pointer shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Placement Odds</span>
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-white font-mono">
              {kpis.placement_probability}%
            </span>
            <span
              className={`block text-[11px] font-bold mt-1 ${
                kpis.placement_probability >= 75
                  ? 'text-emerald-400'
                  : kpis.placement_probability >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {kpis.placement_status}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-800/80">
            <span>Tier: {kpis.predicted_salary_tier}</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto text-indigo-400" />
          </span>
        </div>

        {/* KPI 2: ATS Resume Score */}
        <div
          onClick={() => onNavigate('resume')}
          className="p-5 bg-slate-900/60 rounded-3xl border border-teal-500/30 hover:border-teal-400 transition cursor-pointer shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ATS Resume Score</span>
            <FileText className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-white font-mono">
              {kpis.ats_score ? `${kpis.ats_score}/100` : 'Not Parsed'}
            </span>
            <span className="block text-[11px] font-bold text-teal-300 mt-1">
              Grade: {kpis.ats_grade || 'Pending'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-800/80">
            <span>{kpis.ats_score ? '5 Section Audit' : 'Upload Resume'}</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto text-teal-400" />
          </span>
        </div>

        {/* KPI 3: Top Role Fit */}
        <div
          onClick={() => onNavigate('skillgap')}
          className="p-5 bg-slate-900/60 rounded-3xl border border-purple-500/30 hover:border-purple-400 transition cursor-pointer shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Top Role Fit</span>
            <Target className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-white font-mono">
              {kpis.top_role_match}%
            </span>
            <span className="block text-[11px] font-bold text-purple-300 mt-1 line-clamp-1">
              {kpis.top_role_title}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-800/80">
            <span>3-Tier Skill Gap</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto text-purple-400" />
          </span>
        </div>

        {/* KPI 4: Top Target Company */}
        <div
          onClick={() => onNavigate('jobs')}
          className="p-5 bg-slate-900/60 rounded-3xl border border-amber-500/30 hover:border-amber-400 transition cursor-pointer shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Top Match Job</span>
            <Briefcase className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-white font-mono">
              {kpis.top_company_match}%
            </span>
            <span className="block text-[11px] font-bold text-amber-300 mt-1 line-clamp-1">
              {kpis.top_company_name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-800/80">
            <span>16 Campus Roles</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto text-amber-400" />
          </span>
        </div>

        {/* KPI 5: 8-Week Roadmap Sprint */}
        <div
          onClick={() => onNavigate('roadmap')}
          className="p-5 bg-slate-900/60 rounded-3xl border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer shadow-md flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>8-Wk Roadmap</span>
            <Calendar className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-white font-mono">
              {kpis.roadmap_progress}%
            </span>
            <span className="block text-[11px] font-bold text-emerald-300 mt-1">
              {kpis.completed_tasks_count} / {kpis.total_tasks_count} Tasks
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-800/80">
            <span>Milestones Sprint</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto text-emerald-400" />
          </span>
        </div>
      </div>

      {/* Main Visualizations: Radar Chart & Competency Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recharts Radar / Bar Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                Technical Competency Radar vs Industry Standard
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-axis benchmark comparing your current skills with Tier 1 campus hire expectations.
              </p>
            </div>

            {/* Chart toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setChartMode('radar')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartMode === 'radar'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Radar
              </button>
              <button
                onClick={() => setChartMode('bar')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartMode === 'bar'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Comparison
              </button>
            </div>
          </div>

          {/* Chart Display */}
          <div className="w-full h-80 flex items-center justify-center">
            {chartMode === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar_benchmarks} outerRadius="75%">
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar
                    name="Your Score"
                    dataKey="candidate_score"
                    stroke="#818cf8"
                    fill="#6366f1"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Industry Benchmark"
                    dataKey="industry_benchmark"
                    stroke="#34d399"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={radar_benchmarks}>
                  <XAxis dataKey="subject" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="candidate_score" name="Your Score" fill="#818cf8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="industry_benchmark" name="Benchmark" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Axis Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            {radar_benchmarks.map((point) => {
              const diff = point.candidate_score - point.industry_benchmark;
              const isAhead = diff >= 0;

              return (
                <div key={point.subject} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block line-clamp-1">{point.subject}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-white">{point.candidate_score}</span>
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        isAhead ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isAhead ? '+' : ''}
                      {Math.round(diff)} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Explainable Factors & Launchpad (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Diagnostic Factors Card */}
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Explainable AI Diagnostic Factors
            </h3>

            {/* Positive Drivers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Top Placement Strengths:
              </span>
              <div className="space-y-1.5">
                {data.top_positive_factors.slice(0, 3).map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Warnings */}
            {data.critical_risk_factors.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  Identified Placement Risks:
                </span>
                <div className="space-y-1.5">
                  {data.critical_risk_factors.slice(0, 3).map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Launchpad */}
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Recommended Next Actions
            </h3>

            <div className="space-y-2.5">
              {data.next_recommended_actions.map((act, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (idx === 0) onNavigate('skillgap');
                    else if (idx === 1) onNavigate('jobs');
                    else onNavigate('roadmap');
                  }}
                  className="p-3 bg-slate-950/70 hover:bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.detail}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
