import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Send,
  Building2,
  Briefcase,
  Sparkles,
  Users,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  Award,
  Hash,
} from 'lucide-react';
import {
  fetchOutreachTemplates,
  generateOutreachPitches,
  type OutreachData,
} from '../../services/outreach';

export const LinkedInOutreachView: React.FC = () => {
  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('Software Development Engineer - I');
  const [jobId, setJobId] = useState('');
  const [defaultCompanies, setDefaultCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [outreachData, setOutreachData] = useState<OutreachData | null>(null);
  const [activeTab, setActiveTab] = useState<'alumni_referral' | 'recruiter_dm' | 'hiring_manager' | 'quick_inmail'>('alumni_referral');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadTemplatesAndGenerate();
  }, []);

  const loadTemplatesAndGenerate = async () => {
    try {
      const templatesRes = await fetchOutreachTemplates();
      setDefaultCompanies(templatesRes.default_companies);
      // Generate initial pitch for Google
      handleGenerate('Google', 'Software Development Engineer - I', '');
    } catch {
      // Fallback
    }
  };

  const handleGenerate = async (targetCompany?: string, targetRole?: string, targetId?: string) => {
    const c = targetCompany || company;
    const r = targetRole || role;
    if (!c.trim() || !r.trim()) return;

    try {
      setLoading(true);
      const res = await generateOutreachPitches({
        company_name: c.trim(),
        job_role: r.trim(),
        job_id: targetId !== undefined ? targetId.trim() : jobId.trim(),
      });
      setOutreachData(res);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const getLinkedInSearchUrl = () => {
    const query = `${company} ${outreachData?.candidate_summary?.university || 'University'} software engineer`;
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
  };

  const tabLabels = [
    { key: 'alumni_referral', label: '🎓 Alumni Referral', badge: 'Highest Reply Rate' },
    { key: 'recruiter_dm', label: '🎯 Recruiter InMail', badge: 'Direct Opportunity' },
    { key: 'hiring_manager', label: '💻 Engineering Lead', badge: 'Technical Depth' },
    { key: 'quick_inmail', label: '⚡ 100-Word Note', badge: '300-Char Limit' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Share2 className="w-3.5 h-3.5" />
            1-Click Referral & Outreach Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            LinkedIn Cold Outreach & Referral Pitch Generator
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Turn cold connection requests into high-probability employee referrals. Automatically synthesizes your verified CGPA, LeetCode benchmarks, and capstone project into tailored pitches for alumni and recruiters.
          </p>
        </div>
      </div>

      {/* Target Company & Role Selection Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Customize Your Pitch Parameters
        </h2>

        {/* Quick Company Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Quick Pick:</span>
          {defaultCompanies.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCompany(c);
                handleGenerate(c, role, jobId);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                company.toLowerCase() === c.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Target Company Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Microsoft, Atlassian"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Target Job Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. SDE - I, Backend Engineer"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              Job Requisition ID (Optional)
            </label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="e.g. REQ-98421"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Pitches dynamically reflect your profile highlights from your current student dashboard.
          </p>
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Regenerate Pitches
          </button>
        </div>
      </div>

      {outreachData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Pitch Card (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pitch Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              {tabLabels.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    activeTab === t.key
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`text-[10px] font-normal ${activeTab === t.key ? 'text-blue-200' : 'text-slate-400'}`}>
                    {t.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Pitch Body */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 relative shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-white capitalize">
                    {activeTab.replace('_', ' ')} Pitch
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(outreachData.messages[activeTab], activeTab)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium transition-colors"
                  >
                    {copiedKey === activeTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>1-Click Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getLinkedInSearchUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Find Alumni on LinkedIn</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Message Content Area */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={14}
                  value={outreachData.messages[activeTab]}
                  className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-200 font-mono leading-relaxed resize-none focus:outline-none"
                />
              </div>

              {/* Suggested Subject Lines */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  High-Open Subject Lines (Click to Copy):
                </h4>
                <div className="space-y-1.5">
                  {outreachData.subject_lines.map((subject, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(subject, `sub_${idx}`)}
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 hover:bg-slate-950 border border-slate-800/60 hover:border-blue-500/40 text-xs text-slate-300 hover:text-white cursor-pointer transition-all"
                    >
                      <span className="truncate pr-2 font-mono">✉️ {subject}</span>
                      <span className="text-[11px] text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedKey === `sub_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === `sub_${idx}` ? 'Copied' : 'Copy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Injected Candidate Highlights & Outreach Strategy */}
          <div className="space-y-6">
            {/* Candidate Highlights Injected */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Data Injected into Pitches
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Candidate Name:</span>
                  <span className="text-white font-medium">{outreachData.candidate_summary.name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">CGPA / Academics:</span>
                  <span className="text-emerald-400 font-bold">{outreachData.candidate_summary.cgpa} / 10.0</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">LeetCode Solved:</span>
                  <span className="text-amber-400 font-bold">{outreachData.candidate_summary.total_solved}+ Problems</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Core Language:</span>
                  <span className="text-blue-400 font-medium">{outreachData.candidate_summary.primary_language}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Top Highlighted Project:</span>
                  <span className="text-white font-medium block truncate">{outreachData.candidate_summary.top_project_name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{outreachData.candidate_summary.top_project_tech}</span>
                </div>
              </div>
            </div>

            {/* Pro Tips Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Referral Playbook & Etiquette
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {outreachData.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Times Banner */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-200 block">Pro Timing Tip:</span>
                Tuesday to Thursday, 9:30 AM to 11:00 AM IST has a 4.2x higher response rate.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
