import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Code2,
  BookOpen,
  Layers,
  HelpCircle,
  Lightbulb,
  X,
  Target,
  RefreshCw,
} from 'lucide-react';
import { getAllCompanyPrepSheets } from '../../services/companyPrep';
import type { CompanyCheatSheet } from '../../types/companyPrep';

export const CompanyPrepView: React.FC = () => {
  const [sheets, setSheets] = useState<CompanyCheatSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedSheet, setSelectedSheet] = useState<CompanyCheatSheet | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllCompanyPrepSheets();
      setSheets(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Product Tier 1', 'FinTech / High-Frequency', 'High-Volume / Mass Recruiter'];

  const filteredSheets = sheets.filter((sheet) => {
    const matchesSearch =
      sheet.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.target_role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' || sheet.category.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Company-Specific Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Company Prep Cheat Sheets & OA Dossiers
          </h1>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Detailed hiring roadmaps, OA patterns, top LeetCode frequency rankings, Core CS deep-dives, and STAR behavioral answers for visiting campus recruitment giants — cross-matched against your live academic standing.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search companies (e.g. Google, Amazon, TCS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
          <p className="text-sm">Loading company interview dossiers...</p>
        </div>
      ) : (
        /* Company Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSheets.map((sheet) => {
            const readiness = sheet.readiness_evaluation;
            const isEligible = readiness?.is_eligible ?? true;
            const readinessScore = readiness?.readiness_percentage ?? 75;

            return (
              <div
                key={sheet.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Top Bar: Company & CTC */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-md"
                        style={{ backgroundColor: sheet.logo_color || '#4f46e5' }}
                      >
                        {sheet.company_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                          {sheet.company_name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{sheet.category}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {sheet.ctc_range}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium line-clamp-1 mb-4">
                    Role: <span className="text-white font-semibold">{sheet.target_role}</span>
                  </p>

                  {/* Readiness & Cutoff Strip */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        Candidate Match
                      </span>
                      <span className="font-bold text-white">{readinessScore}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          readinessScore >= 80
                            ? 'bg-emerald-500'
                            : readinessScore >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${readinessScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">
                        Cutoff: <strong>{sheet.eligibility.min_cgpa} CGPA</strong>
                      </span>
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          isEligible ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isEligible ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Eligible
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> Below Cutoff
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Top DSA tags */}
                  <div className="space-y-1.5 mb-5">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      High-Yield DSA Focus:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sheet.top_dsa_patterns.slice(0, 2).map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 font-medium"
                        >
                          {p.pattern.split('(')[0].trim()} ({p.frequency_pct}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Open Full Sheet Button */}
                <button
                  onClick={() => setSelectedSheet(sheet)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold text-xs transition flex items-center justify-center gap-2 group/btn"
                >
                  <span>Open Interview Cheat Sheet</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal / Drawer */}
      {selectedSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-md"
                  style={{ backgroundColor: selectedSheet.logo_color || '#4f46e5' }}
                >
                  {selectedSheet.company_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedSheet.company_name} Prep Dossier
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {selectedSheet.ctc_range}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedSheet.target_role} • {selectedSheet.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSheet(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
              {/* 1. Selection Process Timeline */}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Hiring & Selection Process Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSheet.selection_process.map((round) => (
                    <div
                      key={round.round_num}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">
                          Round {round.round_num}: {round.name}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {round.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{round.focus}</p>
                      <p className="text-[11px] text-slate-500">{round.format}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Top Must-Solve LeetCode Questions */}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  High-Frequency LeetCode Questions (Last 6 Months OA & Interviews)
                </h3>
                <div className="space-y-2">
                  {selectedSheet.frequent_leetcode_questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/30 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-slate-500 w-5">#{idx + 1}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{q.title}</p>
                          <p className="text-[11px] text-slate-400">Core Pattern: {q.topic}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : q.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <a
                          href={q.leetcode_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Solve on LeetCode"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Core CS Questions & STAR Behavioral */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core CS */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-teal-400 flex items-center gap-2 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    Core CS & Systems Must-Knows
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {selectedSheet.core_cs_questions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-400 shrink-0 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Behavioral */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    Key Behavioral & STAR Prompts
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {selectedSheet.star_behavioral_questions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4. Insider Tips */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-2 text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  Alumni Insider Strategies & Common Pitfalls
                </div>
                <ul className="space-y-1.5 pl-5 list-disc text-slate-300">
                  {selectedSheet.insider_tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSheet(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
