import { useState, useEffect } from 'react';
import {
  Compass,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Search,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Plus,
  Play,
} from 'lucide-react';
import { skillGapService } from '../../services/skillGap';
import type {
  RoleSummary,
  SkillGapAnalysisResponse,
  RoleRankingItem,
} from '../../types/skillGap';

export function SkillGapAnalyzer() {
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('full-stack-developer');
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResponse | null>(null);
  const [topRoles, setTopRoles] = useState<RoleRankingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'deep-gap' | 'leaderboard' | 'sandbox'>('deep-gap');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sandbox state
  const [sandboxSkills, setSandboxSkills] = useState<string[]>([]);
  const [newCustomSkill, setNewCustomSkill] = useState<string>('');
  const [sandboxAnalysis, setSandboxAnalysis] = useState<SkillGapAnalysisResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  // Search filter for roles
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Load available roles & top roles ranking
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const [rolesData, topRolesData] = await Promise.all([
          skillGapService.getJobRoles(),
          skillGapService.getTopRoles().catch(() => []),
        ]);
        setRoles(rolesData);
        setTopRoles(topRolesData);
        if (rolesData.length > 0) {
          const initialId = topRolesData.length > 0 ? topRolesData[0].role_id : rolesData[0].id;
          setSelectedRoleId(initialId);
          await loadAnalysis(initialId);
        }
      } catch (err: any) {
        console.error('Failed to initialize skill gap:', err);
        setError(err?.response?.data?.detail || err?.message || 'Failed to load job roles.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function loadAnalysis(roleId: string) {
    try {
      setActionLoading(true);
      setError(null);
      const data = await skillGapService.analyzeRole(roleId);
      setAnalysis(data);
      // Initialize sandbox skills from acquired skills
      setSandboxSkills([...data.acquired_skills]);
    } catch (err: any) {
      console.error('Failed to analyze role:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to evaluate role fit.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRoleSelect(roleId: string) {
    setSelectedRoleId(roleId);
    await loadAnalysis(roleId);
  }

  // Sandbox evaluation
  async function runSandboxSimulation(skillsToSimulate: string[]) {
    try {
      setSimulating(true);
      const simData = await skillGapService.analyzeCustom({
        role_id: selectedRoleId,
        skills: skillsToSimulate,
        cgpa: analysis?.min_recommended_cgpa || 7.5,
      });
      setSandboxAnalysis(simData);
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  }

  function handleToggleSandboxSkill(skill: string) {
    const updated = sandboxSkills.includes(skill)
      ? sandboxSkills.filter((s) => s.toLowerCase() !== skill.toLowerCase())
      : [...sandboxSkills, skill];
    setSandboxSkills(updated);
    runSandboxSimulation(updated);
  }

  function handleAddCustomSkill() {
    if (!newCustomSkill.trim()) return;
    const trimmed = newCustomSkill.trim();
    if (!sandboxSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...sandboxSkills, trimmed];
      setSandboxSkills(updated);
      runSandboxSimulation(updated);
    }
    setNewCustomSkill('');
  }

  // Unique categories
  const categories = ['All', ...Array.from(new Set(roles.map((r) => r.category)))];

  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.critical_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getReadinessBadge = (level: string) => {
    switch (level) {
      case 'Interview Ready':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Nearly Ready':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Moderate Gap':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white">Loading Skill Gap Analytics...</h3>
        <p className="text-sm text-slate-400 mt-1">
          Evaluating 10 industry benchmark taxonomies against your candidate profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phase 7: 3-Tier Skill Gap & Role Fit Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skill Gap Analyzer & Role Fit
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Compare your profile against 10 industry roles with rigorous 3-tier weighting (Critical 50%, Important 35%, Optional 15%), identify screening disqualifiers, and simulate resume skill additions.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('deep-gap')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'deep-gap'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Deep Gap Analysis
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Top Roles Match ({topRoles.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('sandbox');
              if (!sandboxAnalysis && analysis) {
                runSandboxSimulation(sandboxSkills);
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            Skill Sandbox
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* VIEW 1: DEEP GAP ANALYSIS */}
      {activeTab === 'deep-gap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Role Selector & Filters (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Target Job Roles
                </h3>
                <span className="text-xs text-slate-400">{filteredRoles.length} Roles</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by role or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Roles List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredRoles.map((r) => {
                  const isSelected = selectedRoleId === r.id;
                  const topMatch = topRoles.find((t) => t.role_id === r.id);
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/30'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white line-clamp-1">{r.title}</span>
                        {topMatch && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              topMatch.match_percentage >= 70
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : topMatch.match_percentage >= 45
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {topMatch.match_percentage}% Match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{r.category}</span>
                        <span className="text-indigo-300 font-mono">{r.salary_range}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Deep Analysis Dashboard (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {actionLoading ? (
              <div className="p-16 bg-slate-900/60 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                <p className="text-sm text-slate-300 font-medium">Analyzing 3-tier gap metrics...</p>
              </div>
            ) : analysis ? (
              <>
                {/* Role Hero Card */}
                <div className="p-6 sm:p-7 bg-gradient-to-br from-slate-900/90 via-indigo-950/20 to-slate-900/90 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {analysis.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Demand: {analysis.industry_demand}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {analysis.salary_range}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-white">{analysis.role_title}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                        {analysis.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-400">Min CGPA:</span>
                          <span className="font-semibold text-white">
                            {analysis.min_recommended_cgpa}
                          </span>
                          {analysis.cgpa_met ? (
                            <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Met ✓
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded">
                              CGPA Below Rec
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span className="text-slate-400">Estimated Prep Time:</span>
                          <span className="font-bold text-indigo-300">
                            ~{analysis.estimated_prep_weeks} Weeks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Match Gauge */}
                    <div className="flex flex-col items-center justify-center p-5 bg-slate-950/70 rounded-2xl border border-slate-800 shadow-inner flex-shrink-0 min-w-[170px]">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#1e293b"
                            strokeWidth="9"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={
                              analysis.match_percentage >= 75
                                ? '#10b981'
                                : analysis.match_percentage >= 50
                                ? '#f59e0b'
                                : '#f43f5e'
                            }
                            strokeWidth="9"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * analysis.match_percentage) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-2xl font-black text-white font-mono">
                            {analysis.match_percentage}%
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Match</span>
                        </div>
                      </div>

                      <span
                        className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${getReadinessBadge(
                          analysis.readiness_level
                        )}`}
                      >
                        {analysis.readiness_level}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>{analysis.readiness_desc}</span>
                  </div>
                </div>

                {/* 3-Tier Skill Breakdown Breakdown */}
                <div className="space-y-5">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    3-Tier Weighted Skill Breakdown
                  </h4>

                  {/* Tier 1: Critical (50%) */}
                  <div className="p-5 bg-slate-900/60 rounded-2xl border border-rose-500/20 space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <h5 className="text-sm font-bold text-white">
                          Tier 1: Critical Mandatory Skills (50% Weight)
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-emerald-400 font-bold">
                          {analysis.critical_skills_summary.acquired_count} /{' '}
                          {analysis.critical_skills_summary.total_count} Acquired
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-rose-400 font-semibold">
                          {analysis.missing_critical.length} Disqualifier(s)
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Non-negotiable core requirements. Missing any of these skills results in automated resume filtering or screening disqualification.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* Acquired Critical */}
                      {analysis.critical_skills_summary.acquired.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          {skill}
                        </span>
                      ))}

                      {/* Missing Critical (Disqualifiers) */}
                      {analysis.missing_critical.map((item) => (
                        <div
                          key={item.name}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow-sm"
                          title={item.description}
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded font-mono font-bold uppercase">
                            Disqualifier
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier 2: Important (35%) */}
                  <div className="p-5 bg-slate-900/60 rounded-2xl border border-amber-500/20 space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <h5 className="text-sm font-bold text-white">
                          Tier 2: Important Frameworks & Tools (35% Weight)
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-emerald-400 font-bold">
                          {analysis.important_skills_summary.acquired_count} /{' '}
                          {analysis.important_skills_summary.total_count} Acquired
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-amber-400 font-semibold">
                          {analysis.missing_important.length} Missing
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Standard industry technologies expected in day-to-day engineering. High weight in technical rounds.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysis.important_skills_summary.acquired.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          {skill}
                        </span>
                      ))}

                      {analysis.missing_important.map((item) => (
                        <div
                          key={item.name}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40"
                          title={item.description}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono font-bold uppercase">
                            High Priority
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier 3: Optional (15%) */}
                  <div className="p-5 bg-slate-900/60 rounded-2xl border border-indigo-500/20 space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        <h5 className="text-sm font-bold text-white">
                          Tier 3: Bonus Differentiators (15% Weight)
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-emerald-400 font-bold">
                          {analysis.optional_skills_summary.acquired_count} /{' '}
                          {analysis.optional_skills_summary.total_count} Acquired
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Advanced specializations and cloud integrations that set candidates apart from standard applicants.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysis.optional_skills_summary.acquired.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          {skill}
                        </span>
                      ))}

                      {analysis.missing_optional.map((item) => (
                        <div
                          key={item.name}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30"
                          title={item.description}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono font-bold uppercase">
                            Differentiator
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* High-ROI Learning Roadmap Ranking */}
                {analysis.roi_recommendations.length > 0 && (
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Priority ROI Learning Sequence
                    </h4>
                    <p className="text-xs text-slate-400">
                      Calculated sequence of high-impact skills to acquire next. Prioritizes screening disqualifiers to deliver the fastest percentage match boost.
                    </p>

                    <div className="space-y-2.5">
                      {analysis.roi_recommendations.map((rec, idx) => (
                        <div
                          key={rec.skill}
                          className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{rec.skill}</span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                    rec.tier === 'Critical'
                                      ? 'bg-rose-500/20 text-rose-300'
                                      : rec.tier === 'Important'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-indigo-500/20 text-indigo-300'
                                  }`}
                                >
                                  {rec.tier}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{rec.action}</p>
                            </div>
                          </div>

                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl self-start sm:self-auto flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" />
                            {rec.roi_impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* VIEW 2: TOP ROLES LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Candidate Role Fit Leaderboard
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              All 10 benchmark engineering roles ranked by mathematical fit with your candidate profile skills and CGPA. Click any role to inspect its full gap report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topRoles.map((role, idx) => (
              <div
                key={role.role_id}
                onClick={() => {
                  setSelectedRoleId(role.role_id);
                  setActiveTab('deep-gap');
                  loadAnalysis(role.role_id);
                }}
                className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between gap-4 ${
                  selectedRoleId === role.role_id
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {role.role_title}
                      </h4>
                      <span className="text-xs text-slate-400">{role.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-white font-mono">
                      {role.match_percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      Match Score
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      role.match_percentage >= 70
                        ? 'bg-emerald-500'
                        : role.match_percentage >= 45
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${role.match_percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getReadinessBadge(
                      role.readiness_level
                    )}`}
                  >
                    {role.readiness_level}
                  </span>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="text-rose-400 font-medium">
                      {role.missing_critical_count} Disqualifiers
                    </span>
                    <span>~{role.estimated_prep_weeks} Wks Prep</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: SKILL SANDBOX / WHAT-IF SIMULATOR */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Skill Sandbox & Real-Time Impact Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Test &quot;What if I learn these skills?&quot; Toggle missing role skills or add custom skills below to see the match percentage jump in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Missing skills to toggle & custom adder (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Selected Target Role */}
              <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Simulating Role:
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => {
                    setSelectedRoleId(e.target.value);
                    loadAnalysis(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Missing Skills Quick Toggles */}
              {analysis && (
                <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Click to Simulate Acquiring Missing Skills:
                  </h4>

                  <div className="space-y-3">
                    {/* Critical */}
                    {analysis.missing_critical.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-rose-400 block mb-1.5">
                          Critical Disqualifiers (+10% score each):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missing_critical.map((item) => {
                            const isIncluded = sandboxSkills.some(
                              (s) => s.toLowerCase() === item.name.toLowerCase()
                            );
                            return (
                              <button
                                key={item.name}
                                onClick={() => handleToggleSandboxSkill(item.name)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                  isIncluded
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-950/80 text-rose-300 border border-rose-500/30 hover:border-rose-400'
                                }`}
                              >
                                {isIncluded ? <CheckCircle className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Important */}
                    {analysis.missing_important.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-amber-400 block mb-1.5">
                          Important Technologies (+5.8% score each):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missing_important.map((item) => {
                            const isIncluded = sandboxSkills.some(
                              (s) => s.toLowerCase() === item.name.toLowerCase()
                            );
                            return (
                              <button
                                key={item.name}
                                onClick={() => handleToggleSandboxSkill(item.name)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                  isIncluded
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-950/80 text-amber-300 border border-amber-500/30 hover:border-amber-400'
                                }`}
                              >
                                {isIncluded ? <CheckCircle className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add Custom Skill */}
              <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Add Any Custom Technology:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Kubernetes, Redis, PyTorch..."
                    value={newCustomSkill}
                    onChange={(e) => setNewCustomSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddCustomSkill}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Simulate
                  </button>
                </div>

                {/* Current Active Sandbox Skills */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-2">
                    Current Simulated Skill Portfolio ({sandboxSkills.length} skills):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {sandboxSkills.map((s) => (
                      <span
                        key={s}
                        onClick={() => handleToggleSandboxSkill(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-300 border border-slate-800 hover:border-rose-500 hover:text-rose-300 transition cursor-pointer"
                      >
                        {s}
                        <span className="text-[10px] text-slate-500">×</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Simulated Output Gauge & Impact (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {simulating ? (
                <div className="p-16 bg-slate-900/60 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                  <p className="text-sm text-slate-300 font-medium">Recalculating Match Matrix...</p>
                </div>
              ) : sandboxAnalysis ? (
                <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Simulated Readiness Score
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-white font-mono flex items-center justify-center gap-2">
                      <span>{sandboxAnalysis.match_percentage}%</span>
                      {analysis && (
                        <span
                          className={`text-sm font-bold font-sans px-2.5 py-0.5 rounded-full ${
                            sandboxAnalysis.match_percentage >= analysis.match_percentage
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {sandboxAnalysis.match_percentage >= analysis.match_percentage ? '+' : ''}
                          {roundTwo(sandboxAnalysis.match_percentage - analysis.match_percentage)}%
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border ${getReadinessBadge(
                        sandboxAnalysis.readiness_level
                      )}`}
                    >
                      {sandboxAnalysis.readiness_level}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Remaining Disqualifiers:</span>
                      <span className="font-bold text-rose-400">
                        {sandboxAnalysis.missing_critical.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Remaining Important Gaps:</span>
                      <span className="font-bold text-amber-400">
                        {sandboxAnalysis.missing_important.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Estimated Prep Time:</span>
                      <span className="font-bold text-indigo-300">
                        ~{sandboxAnalysis.estimated_prep_weeks} Weeks
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    Bridging critical skills moves your application past automated enterprise screening filters.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function roundTwo(num: number): number {
  return Math.round(num * 10) / 10;
}
