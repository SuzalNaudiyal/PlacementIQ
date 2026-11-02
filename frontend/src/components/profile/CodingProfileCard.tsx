import React, { useState, useEffect } from 'react';
import {
  Code2,
  Award,
  Star,
  Sparkles,
  CheckCircle2,
  Layers,
  Target,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  GitCommit,
  Flame,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { verifyCodingProfiles, getMyCodingProfiles } from '../../services/codingProfiles';
import type { CodingProfileResponse } from '../../types/codingProfiles';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface CodingProfileCardProps {
  onProfileSynced?: (data: CodingProfileResponse) => void;
}

export const CodingProfileCard: React.FC<CodingProfileCardProps> = ({ onProfileSynced }) => {
  const [githubUser, setGithubUser] = useState('');
  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [codingData, setCodingData] = useState<CodingProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadExisting();
  }, []);

  const loadExisting = async () => {
    try {
      const res = await getMyCodingProfiles();
      setCodingData(res);
      if (res.github_username) setGithubUser(res.github_username);
      if (res.leetcode_username) setLeetcodeUser(res.leetcode_username);
    } catch {
      // Non-blocking if first time
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubUser.trim() && !leetcodeUser.trim()) {
      setErrorMsg('Please enter at least one GitHub or LeetCode username.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await verifyCodingProfiles({
        github_username: githubUser.trim() || undefined,
        leetcode_username: leetcodeUser.trim() || undefined,
      });

      setCodingData(res);
      setSuccessMsg(
        `Profiles verified! Coding score calibrated to ${res.calibrated_coding_score}/100 and synchronized with ML readiness.`
      );
      if (onProfileSynced) {
        onProfileSynced(res);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || err.message || 'Verification failed. Please check handles and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const cqi = codingData?.code_quality_index || 0;
  const calibratedScore = codingData?.calibrated_coding_score || 70;
  const gh = codingData?.github_stats;
  const lc = codingData?.leetcode_stats;
  const badges = codingData?.badges || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Coding Footprint
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              GitHub & LeetCode Scraper Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Connect your open-source repositories and algorithmic problem solving. Our real-time scraper calculates your composite <strong>Code Quality Index (CQI)</strong> and automatically updates your ML placement readiness.
            </p>
          </div>

          {/* Calibrated score preview pill */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl shrink-0">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg">
              {Math.round(calibratedScore)}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Calibrated Score</p>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>CQI: {cqi}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Input Form */}
        <form onSubmit={handleVerify} className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <GithubIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="GitHub username (e.g. SuzalNaudiyal)"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
              <Code2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="LeetCode username (e.g. suzal)"
              value={leetcodeUser}
              onChange={(e) => setLeetcodeUser(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scrape & Sync</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Notifications */}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Scraped Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LeetCode Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  LeetCode DSA Breakdown
                  {lc && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Verified
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {lc?.username ? `@${lc.username}` : 'No profile connected yet'}
                </p>
              </div>
            </div>

            {lc?.username && (
              <a
                href={`https://leetcode.com/${lc.username}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="View LeetCode Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {lc ? (
            <div className="space-y-4">
              {/* Total Solved Header */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Solved</p>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {lc.total_solved}{' '}
                    <span className="text-xs font-normal text-slate-400">problems</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Global Ranking</p>
                  <p className="text-sm font-bold text-amber-400 mt-0.5">
                    #{lc.ranking.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Acceptance Rate</p>
                  <p className="text-sm font-bold text-teal-400 mt-0.5">
                    {lc.acceptance_rate}%
                  </p>
                </div>
              </div>

              {/* Easy / Med / Hard Bars */}
              <div className="space-y-3">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-emerald-400">Easy</span>
                    <span className="text-slate-300">{lc.easy_solved} solved</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (lc.easy_solved / 150) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-amber-400">Medium (Campus Standard)</span>
                    <span className="text-slate-300">{lc.medium_solved} solved</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (lc.medium_solved / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-rose-400">Hard</span>
                    <span className="text-slate-300">{lc.hard_solved} solved</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (lc.hard_solved / 40) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <Target className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Campus Target</strong>: Reaching 40+ Mediums elevates your coding OA clearance probability by ~38%.
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm">
              Enter your LeetCode handle above to scrape your problem-solving metrics.
            </div>
          )}
        </div>

        {/* GitHub Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                <GithubIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  GitHub Engineering Metrics
                  {gh && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {gh?.username ? `@${gh.username}` : 'No profile connected yet'}
                </p>
              </div>
            </div>

            {gh?.username && (
              <a
                href={`https://github.com/${gh.username}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="View GitHub Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {gh ? (
            <div className="space-y-4">
              {/* GitHub KPI Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                  <p className="text-xs text-slate-400">Repositories</p>
                  <p className="text-lg font-bold text-white mt-0.5">{gh.public_repos}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                  <p className="text-xs text-slate-400">Stars Earned</p>
                  <p className="text-lg font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {gh.stars_received}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                  <p className="text-xs text-slate-400">30d Commits</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                    <GitCommit className="w-3.5 h-3.5" />
                    {gh.recent_commits_30d}
                  </p>
                </div>
              </div>

              {/* Languages */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Primary Repository Languages
                </p>
                <div className="flex flex-wrap gap-2">
                  {gh.top_languages.length > 0 ? (
                    gh.top_languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None detected</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                <Flame className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>
                  <strong>Commit Velocity</strong>: Consistent 30-day activity signals strong dev momentum to automated campus screeners.
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm">
              Enter your GitHub handle above to analyze your repositories and commit velocity.
            </div>
          )}
        </div>
      </div>

      {/* Verification Badges Grid */}
      {badges.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Verified Coding Achievements & Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 transition hover:border-indigo-500/40"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{b.title}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{b.tier} tier</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
