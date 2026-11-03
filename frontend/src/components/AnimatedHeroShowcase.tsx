import React, { useState } from 'react';
import {
  Brain,
  Mic,
  Zap,
  FileText,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Volume2,
} from 'lucide-react';

interface AnimatedHeroShowcaseProps {
  onOpenAuth: () => void;
  onNavigateToTool?: (toolId: any) => void;
  isAuthenticated: boolean;
}

export const AnimatedHeroShowcase: React.FC<AnimatedHeroShowcaseProps> = ({
  onOpenAuth,
  onNavigateToTool,
  isAuthenticated,
}) => {
  const [activeDemoTab, setActiveDemoTab] = useState<'svar' | 'predictor' | 'ats' | 'outreach'>('svar');
  const [copiedPitch, setCopiedPitch] = useState(false);

  const handleCopyPitch = () => {
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleAction = (toolId: string) => {
    if (!isAuthenticated) {
      onOpenAuth();
    } else if (onNavigateToTool) {
      onNavigateToTool(toolId);
    }
  };

  return (
    <div className="w-full relative mt-6 mb-16">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-16 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-10 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Headline & Interactive Tagline */}
      <div className="text-center max-w-4xl mx-auto mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm backdrop-blur-md animate-float">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>HireMatrix AI • Next-Gen Campus Placement Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Crack Campus Placements with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 animate-text-shimmer">
            Real-Time Voice AI
          </span>{' '}
          & Predictable ML
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Simulate corporate technical rounds, evaluate SVAR voice fluency, audit your resume against Fortune 500 ATS filters, and forecast your dream package with explainable AI.
        </p>

        {/* Primary Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={() => handleAction('assessments')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] ring-1 ring-white/20"
          >
            <Brain className="w-4 h-4 text-indigo-200" />
            <span>Launch Aptitude & SVAR Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAction('prediction')}
            className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 font-semibold text-sm shadow-lg backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulate Placement Odds</span>
          </button>
        </div>

        {/* Quick Micro-Metrics */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-8 pt-6 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span><strong className="text-white font-semibold">94.2%</strong> Prediction Precision</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span><strong className="text-white font-semibold">&lt;1.2s</strong> SVAR Voice Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span><strong className="text-white font-semibold">100%</strong> Anti-Cheat Sanitized</span>
          </div>
        </div>
      </div>

      {/* Interactive Bento Showcase: 4 Live Animated Widgets */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Interactive Preview Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'svar', label: '🎙️ SVAR Voice English AI', color: 'indigo' },
            { id: 'predictor', label: '⚡ Placement ML Predictor', color: 'amber' },
            { id: 'ats', label: '📄 ATS Resume Scanner', color: 'teal' },
            { id: 'outreach', label: '🚀 1-Click LinkedIn Pitch', color: 'blue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDemoTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeDemoTab === tab.id
                  ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Widget Display Box */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500">
          {/* Top Window Action Dots */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="text-xs font-mono text-slate-500 ml-2">hirematrix-engine://interactive-telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Engine Online
              </span>
            </div>
          </div>

          {/* WIDGET 1: SVAR VOICE AI */}
          {activeDemoTab === 'svar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                  <Mic className="w-3.5 h-3.5 text-indigo-400" />
                  <span>SVAR / Versant Sentence Audio Repeat Engine</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Corporate English & Pronunciation Assessment
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Used by multinational tech consultancies (TCS, Infosys, Cognizant, Wipro) to evaluate candidate spoken English, fluency, and keyword retention.
                </p>

                {/* Simulated Audio Waveform Box */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                      <Volume2 className="w-4 h-4" />
                      Original Prompt
                    </span>
                    <span className="font-mono text-slate-500">Audio Time: 00:03.4</span>
                  </div>
                  <p className="text-sm font-medium text-slate-100 italic bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                    "The distributed microservices architecture scales efficiently under peak server load."
                  </p>

                  {/* Animated Waveform Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-12 pt-1">
                    {[12, 24, 18, 32, 28, 14, 26, 30, 20, 36, 22, 16, 28, 18].map((height, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400"
                        style={{
                          height: `${height}px`,
                          animation: 'soundWave 1.2s ease-in-out infinite',
                          animationDelay: `${(i % 5) * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Real-time Candidate Transcription Feedback */}
                  <div className="pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">Detected Student Response: </span>
                    <span className="text-emerald-300 font-mono">
                      "The distributed microservices architecture scales efficiently under peak server load."
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Telemetry Score Card */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 border border-indigo-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">AI Evaluation Report</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PASSED (CEFR C1)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-2xl font-extrabold text-white">96%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Pronunciation</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-2xl font-extrabold text-indigo-400">94%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Fluency Index</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-2xl font-extrabold text-cyan-400">100%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Keyword Match</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-2xl font-extrabold text-emerald-400">0.00</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Word Error Rate</div>
                  </div>
                </div>

                <button
                  onClick={() => handleAction('assessments')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Practice SVAR Voice Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* WIDGET 2: PLACEMENT ML PREDICTOR */}
          {activeDemoTab === 'predictor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Supervised Ensemble Classifier & SHAP Explainability</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Realistic Placement Probability & Salary Forecast
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Trained on multi-dimensional academic metrics, coding contest profiles (LeetCode/Codeforces), technical certifications, and live internship breadth.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>What-If Interactive Parameter Simulation</span>
                    <span className="text-emerald-400 font-mono">+12.4% Potential Uplift</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>LeetCode Solved: 280+ (Medium & Hard)</span>
                        <span className="font-semibold text-indigo-400">+8.5% Impact</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full w-[78%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Aptitude & SVAR Score: 92/100</span>
                        <span className="font-semibold text-emerald-400">+9.2% Impact</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[92%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Prediction Result */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-indigo-950/30 border border-amber-500/20 shadow-xl text-center space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">Placement Forecast</div>
                
                {/* Gauge Circle */}
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-amber-400"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="26"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">89.4%</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Likelihood</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400">Estimated Compensation Band</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">14.0 - 18.5 LPA</div>
                </div>

                <button
                  onClick={() => handleAction('prediction')}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Run Full Predictor & What-If</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* WIDGET 3: ATS RESUME SCANNER */}
          {activeDemoTab === 'ats' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>NLP Parser & Keyword Attribution Scanner</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Real-Time ATS Screening with Laser Precision
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Extracts skills, project achievements, and experience with zero hallucination. Audits your resume against target job role descriptions.
                </p>

                {/* Simulated Scanner with Laser Line */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden space-y-3">
                  {/* Animated Laser Scanline */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-scanline pointer-events-none" />

                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-200">Candidate_Resume.pdf</span>
                    <span className="text-teal-400 font-mono">Scanning Section: Technical Stack...</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {['FastAPI', 'React 19', 'Docker', 'PostgreSQL', 'PyTorch', 'Distributed Systems', 'TailwindCSS'].map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-teal-400" />
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 pt-2">
                    Action Verbs: <span className="text-emerald-400 font-medium">Architected, Implemented, Deployed, Optimized (4/4 High Impact)</span>
                  </p>
                </div>
              </div>

              {/* Right Side: Score Card */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-teal-950/30 via-slate-900/60 to-slate-950 border border-teal-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">ATS Audit Report</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    TIER-1 PASS
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-4xl font-extrabold text-white">92<span className="text-teal-400 text-2xl">/100</span></div>
                  <div className="text-xs text-slate-400 mt-1">Overall ATS Readiness Score</div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Format & Layout</span>
                    <span className="text-emerald-400 font-semibold">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Keyword Density</span>
                    <span className="text-teal-400 font-semibold">90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Measurable Impact Metrics</span>
                    <span className="text-indigo-400 font-semibold">88%</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAction('resume')}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Upload & Audit Resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* WIDGET 4: 1-CLICK LINKEDIN PITCH */}
          {activeDemoTab === 'outreach' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>1-Click LinkedIn Cold Outreach & Referral Engine</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Get Interview Referrals from Alumni & Tech Leaders
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Tailors high-converting message pitches based on the target company, candidate skills, and hiring manager's background.
                </p>

                {/* Message Bubble Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-blue-400">Target: Staff Engineer / Hiring Lead @ Microsoft</span>
                    <span className="text-slate-500">Subject: SDE-1 Referral Request</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 font-mono">
                    "Hi Priya, saw your team's recent work on Azure Container Apps. I'm a final-year CS undergrad specializing in FastAPI & Kubernetes, with 280+ LeetCode problems solved. I noticed Req #8491 for SDE-1 and would love 2 minutes of your advice or a referral consideration. Best, Suzal."
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Template: Concise Engineering Referral Pitch</span>
                    <button
                      onClick={handleCopyPitch}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
                    >
                      {copiedPitch ? '✓ Copied to Clipboard!' : 'Copy Pitch'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Pitch Performance Card */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-indigo-950/30 border border-blue-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Outreach Analytics</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    HIGH CONVERSION
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-2xl font-extrabold text-blue-400">3.8x</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Higher Response</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-2xl font-extrabold text-emerald-400">&lt;60s</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Generation Time</div>
                  </div>
                </div>

                <button
                  onClick={() => handleAction('outreach')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Generate Custom Referral Pitch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
