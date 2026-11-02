import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Code2,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  FileCode,
} from 'lucide-react';
import { uploadResumeFile, parseResumeText } from '../../services/resume';
import type { ParsedResumeResponse } from '../../types/resume';

const SAMPLE_BENCHMARK_RESUME = `Alex Mercer
alex.mercer@gmail.com | +91 9876543210 | Bangalore, India
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

EDUCATION
Apex Institute of Technology
Bachelor of Technology in Computer Science & Engineering
CGPA: 8.4 / 10 | Expected Graduation: 2026

TECHNICAL SKILLS
Programming: Python, Java, JavaScript, TypeScript, C++
Frameworks & Libraries: ReactJS, FastAPI, Node.js, Express, Next.js
Databases: PostgreSQL, MongoDB, Redis
Cloud & DevOps: Docker, Kubernetes, AWS, Git, CI/CD
Machine Learning & Data: Pandas, NumPy, Scikit-learn, PyTorch

PROJECTS
High-Throughput E-Commerce API Engine
- Architected and developed a distributed microservices REST API handling 10,000+ daily queries using FastAPI and PostgreSQL.
- Optimized database indexing and query latency by 45%, reducing p99 response time from 220ms to 85ms.
- Containerized microservices using Docker and orchestrated multi-container deployment on AWS.

Real-Time Sentiment Analysis Pipeline
- Engineered real-time tweet stream sentiment classification system achieving 92.4% test accuracy using PyTorch and NLP transformers.
- Streamlined model serving throughput by 3x via ONNX runtime optimizations.

EXPERIENCE
Apex Analytics Lab
Software Engineering Intern | June 2024 - August 2024
- Implemented real-time telemetry dashboards for 500+ active enterprise users using React and WebSockets.
- Accelerated automated testing pipeline, cutting regression suite execution time by 35%.

CERTIFICATIONS
- AWS Certified Cloud Practitioner
- Python for Data Science (Coursera)`;

interface ResumeAnalyzerProps {
  onProfileSynced?: () => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onProfileSynced }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [applyToProfile, setApplyToProfile] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ParsedResumeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (fileToUpload: File) => {
    try {
      setLoading(true);
      setError(null);
      const res = await uploadResumeFile(fileToUpload, applyToProfile);
      setResult(res);
      if (res.profile_updated && onProfileSynced) {
        onProfileSynced();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(errorObj.response?.data?.detail || errorObj.message || 'Failed to upload and parse resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextParse = async () => {
    if (!pastedText.trim() || pastedText.length < 30) {
      setError('Please paste at least 30 characters of resume text.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await parseResumeText(pastedText, applyToProfile);
      setResult(res);
      if (res.profile_updated && onProfileSynced) {
        onProfileSynced();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(errorObj.response?.data?.detail || errorObj.message || 'Failed to parse resume text.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setActiveTab('paste');
    setPastedText(SAMPLE_BENCHMARK_RESUME);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              NLP Resume Intelligence & ATS Scoring
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Resume Parser & ATS Auditor
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1 leading-relaxed">
              Upload your resume in PDF, DOCX, or text format. Our NLP engine extracts contact details, verified skills taxonomy, project impacts, and audits against enterprise ATS scoring rules.
            </p>
          </div>

          <button
            onClick={handleLoadSample}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            Load Sample Tier-1 Resume
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload Document (PDF / DOCX)
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'paste'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paste Resume Text
            </button>
          </div>

          {/* Sync Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyToProfile}
              onChange={(e) => setApplyToProfile(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <span>Auto-merge extracted skills & education into My Profile</span>
          </label>
        </div>

        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setSelectedFile(file);
                  handleFileUpload(file);
                }
              }}
              className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 sm:p-12 text-center bg-slate-950/40 hover:bg-slate-950/60 transition group cursor-pointer"
              onClick={() => {
                document.getElementById('resume-file-input')?.click();
              }}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setSelectedFile(file);
                    handleFileUpload(file);
                  }
                }}
              />
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Click to browse or drag & drop your resume'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, or TXT (Max 10MB)</p>
            </div>
          </div>
        )}

        {/* Tab 2: Paste */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw resume text here..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none resize-y"
            />
            <div className="flex justify-end">
              <button
                onClick={handleTextParse}
                disabled={loading || !pastedText.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Analyzing Text...' : 'Parse Resume Text'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl flex items-center justify-center gap-3 text-indigo-300 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Extracting sections, NLP entities, and computing ATS compatibility score...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* ATS Score Overview Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* ATS Gauge */}
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${
                        result.ats_analysis.total_score >= 80
                          ? 'text-emerald-400'
                          : result.ats_analysis.total_score >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      } transition-all duration-1000 ease-out`}
                      strokeDasharray={`${result.ats_analysis.total_score}, 100`}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white">{result.ats_analysis.total_score}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">/ 100 ATS</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {result.ats_analysis.rating}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">ATS Compatibility Audit</h3>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">{result.ats_analysis.summary}</p>
                  {result.profile_updated && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium pt-1">
                      <CheckCircle2 className="w-4 h-4" /> Extracted skills and education successfully synced to your profile!
                    </p>
                  )}
                </div>
              </div>

              {/* Sub-Score Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                {result.ats_analysis.section_scores.map((sec, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-medium truncate max-w-[100px]">{sec.section_name}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {sec.score}/{sec.max_score}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${(sec.score / sec.max_score) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">{sec.feedback}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parsed Candidate Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Parsed Contact Information
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Candidate Name</span>
                  <span className="text-white font-semibold">{result.contact.name || 'Not detected'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Email Address</span>
                  <span className="text-indigo-300 font-mono">{result.contact.email || 'Not detected'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Phone Number</span>
                  <span className="text-white font-mono">{result.contact.phone || 'Not detected'}</span>
                </div>
                {result.contact.linkedin && (
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">LinkedIn Profile</span>
                    <a href={result.contact.linkedin} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {result.contact.github && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">GitHub Profile</span>
                    <a href={result.contact.github} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Education Details */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-400" />
                Parsed Education Standing
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Degree</span>
                  <span className="text-white font-semibold">{result.education.degree || 'B.Tech'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Specialization</span>
                  <span className="text-white font-semibold">{result.education.branch || 'Computer Science'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Graduation Year</span>
                  <span className="text-white font-mono">{result.education.graduation_year || 2026}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Extracted CGPA</span>
                  <span className="text-emerald-400 font-bold font-mono">{result.education.cgpa ? `${result.education.cgpa} / 10` : 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Skills */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Extracted Skills & Taxonomy Match
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result.skills).map(([cat, skillsList]) => (
                <div key={cat} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider">{cat}</span>
                    <span className="font-mono text-slate-500">({skillsList.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                        {skill}
                      </span>
                    ))}
                    {skillsList.length === 0 && <span className="text-[11px] text-slate-600 italic">None detected</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ATS Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Detected ATS Strengths
              </h3>
              <ul className="space-y-2">
                {result.ats_analysis.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                High-Priority ATS Improvements
              </h3>
              <ul className="space-y-2">
                {result.ats_analysis.critical_improvements.map((imp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
