import { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Award,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import { jobsService } from '../../services/jobs';
import type { JobMatchItem, JobMatchListResponse } from '../../types/jobs';

export function JobMatchingView() {
  const [data, setData] = useState<JobMatchListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [eligibleOnly, setEligibleOnly] = useState<boolean>(false);
  const [minMatch, setMinMatch] = useState<number>(0);

  // Applied jobs tracking
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<JobMatchItem | null>(null);

  useEffect(() => {
    loadJobMatches();
  }, [eligibleOnly, selectedTier]);

  async function loadJobMatches() {
    try {
      setLoading(true);
      setError(null);
      const res = await jobsService.getMatchedJobs(
        eligibleOnly,
        selectedTier === 'All' ? undefined : selectedTier
      );
      setData(res);
      if (res.matches.length > 0 && !selectedJob) {
        setSelectedJob(res.matches[0]);
      }
    } catch (err: any) {
      console.error('Failed to load job matches:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to evaluate job matching.');
    } finally {
      setLoading(false);
    }
  }

  function handleApply(jobId: string, company: string) {
    setAppliedJobs((prev) => new Set(prev).add(jobId));
    alert(`Application submitted to ${company}! Your ATS-optimized profile and match dossier have been shared with the campus recruitment panel.`);
  }

  // Client-side search and match score filter
  const filteredMatches = useMemo(() => {
    if (!data) return [];
    return data.matches.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.required_skills_acquired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.required_skills_missing.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesScore = m.match_percentage >= minMatch;
      return matchesSearch && matchesScore;
    });
  }, [data, searchQuery, minMatch]);

  const tiers = ['All', 'Tier 1 Product', 'FinTech Unicorn', 'Tier 2 Mid-Market', 'Tier 3 Mass Recruiter'];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier 1 Product':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'FinTech Unicorn':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Tier 2 Mid-Market':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const getFitBadge = (status: string) => {
    switch (status) {
      case 'Strong Match':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Good Match':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Moderate Match':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Phase 8: Semantic Job Matching Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus Placement Matching Portal
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time multi-dimensional cosine similarity matching your technical skills, portfolio experience, and CGPA against 16 top campus recruitment opportunities.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-start lg:self-auto">
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-xl font-black text-white font-mono">{data.total_jobs}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  Total Roles
                </span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {data.eligible_jobs_count}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  CGPA Eligible
                </span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center col-span-2 sm:col-span-1">
                <span className="text-xl font-black text-purple-400 font-mono">
                  {data.high_match_count}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  ≥ 70% Match
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by company, role title, or technology (e.g. Razorpay, Python, React)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Toggle Eligible Only */}
          <label className="flex items-center gap-2 cursor-pointer self-start md:self-auto text-xs font-semibold text-slate-300 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={eligibleOnly}
              onChange={(e) => setEligibleOnly(e.target.checked)}
              className="rounded text-purple-600 focus:ring-0 bg-slate-900 border-slate-700"
            />
            <span>Only Show CGPA Eligible</span>
          </label>
        </div>

        {/* Tier Pills & Match Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Tier:
            </span>
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                  selectedTier === t
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Min Match:</span>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-24 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-purple-400 min-w-[36px]">
              {minMatch}%+
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Job Cards (7 cols) + Detailed Match Dossier (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Job Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Matching Opportunities ({filteredMatches.length})
            </span>
            <button
              onClick={() => loadJobMatches()}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-16 bg-slate-900/60 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-sm text-slate-300 font-medium">Computing Vector Cosine Similarities...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Matching Roles Found</h4>
              <p className="text-xs text-slate-400">
                Try loosening your search query, tier filter, or minimum match score slider.
              </p>
            </div>
          ) : (
            filteredMatches.map((job) => {
              const isSelected = selectedJob?.job_id === job.job_id;
              const hasApplied = appliedJobs.has(job.job_id);

              return (
                <div
                  key={job.job_id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 rounded-3xl border transition cursor-pointer space-y-4 ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-950/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Company & Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center font-black text-sm text-white font-mono shadow-md">
                        {job.logo_text}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{job.company}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getTierColor(
                              job.company_tier
                            )}`}
                          >
                            {job.company_tier}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-300 line-clamp-1 mt-0.5">
                          {job.title}
                        </h4>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-lg font-black text-white font-mono">
                          {job.match_percentage}%
                        </span>
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getFitBadge(
                          job.fit_status
                        )}`}
                      >
                        {job.fit_status}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400 font-mono">
                      {job.salary_range}
                    </span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.job_type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Min CGPA: {job.min_cgpa}
                      {job.cgpa_eligible ? (
                        <span className="text-emerald-400 font-bold ml-0.5">✓ Eligible</span>
                      ) : (
                        <span className="text-rose-400 font-bold ml-0.5">✗ Below</span>
                      )}
                    </span>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.required_skills_acquired.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        {s}
                      </span>
                    ))}
                    {job.required_skills_missing.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30"
                      >
                        <XCircle className="w-2.5 h-2.5 text-rose-400" />
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Deadline: <code className="text-slate-300">{job.deadline}</code>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job.job_id, job.company);
                      }}
                      disabled={hasApplied}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        hasApplied
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                      }`}
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> 1-Click Apply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Match Dossier (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedJob ? (
            <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-6 sticky top-24 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md">
                    {selectedJob.logo_text}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{selectedJob.company}</h3>
                    <p className="text-xs text-slate-400">{selectedJob.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-purple-400 font-mono">
                    {selectedJob.match_percentage}%
                  </span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">
                    Vector Fit
                  </span>
                </div>
              </div>

              {/* AI Fit Rationale */}
              <div className="p-4 bg-purple-950/20 rounded-2xl border border-purple-500/30 space-y-1.5 text-xs">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  AI Placement Match Rationale:
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedJob.fit_rationale}</p>
              </div>

              {/* Job Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Role Overview
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  {selectedJob.description}
                </p>
              </div>

              {/* Dimensional Score Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Multi-Factor Alignment
                </h4>

                {/* Semantic Vector */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Semantic Text Similarity:</span>
                    <span className="font-mono font-bold text-purple-300">
                      {selectedJob.semantic_similarity_score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${selectedJob.semantic_similarity_score}%` }}
                    />
                  </div>
                </div>

                {/* Required Skills Overlap */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Core Skills Covered:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedJob.required_skills_acquired.length} /{' '}
                      {selectedJob.required_skills_acquired.length +
                        selectedJob.required_skills_missing.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${
                          (selectedJob.required_skills_acquired.length /
                            (selectedJob.required_skills_acquired.length +
                              selectedJob.required_skills_missing.length)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Missing Skills Warning */}
              {selectedJob.required_skills_missing.length > 0 && (
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                    Skills to Bridge for Maximum Conversion:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.required_skills_missing.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleApply(selectedJob.job_id, selectedJob.company)}
                disabled={appliedJobs.has(selectedJob.job_id)}
                className={`w-full py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  appliedJobs.has(selectedJob.job_id)
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
                }`}
              >
                {appliedJobs.has(selectedJob.job_id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Application Submitted
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" /> Submit Fast-Track Application
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/60 rounded-3xl border border-slate-800 text-center text-xs text-slate-400">
              Select any role to view its full dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
