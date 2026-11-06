import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export const PhaseTracker: React.FC = () => {
  const phases = [
    { number: 1, title: 'Architecture & Foundation', status: 'completed', desc: 'FastAPI, React, Motor, Docker, Health Check' },
    { number: 2, title: 'Database & Auth', status: 'completed', desc: 'JWT, MongoDB collections, password hashing' },
    { number: 3, title: 'Student Profile', status: 'completed', desc: 'Academic, skills, & assessment data forms' },
    { number: 4, title: 'Dataset & ML Pipeline', status: 'completed', desc: 'Synthetic/real datasets & model training' },
    { number: 5, title: 'Prediction API', status: 'completed', desc: 'Model serving with explainability (SHAP)' },
    { number: 6, title: 'Resume Parser (NLP)', status: 'completed', desc: 'spaCy, PyMuPDF, skill extraction' },
    { number: 7, title: 'Skill Gap Engine', status: 'completed', desc: '10+ Tech roles & 3-tier gap breakdown' },
    { number: 8, title: 'Job Matching', status: 'completed', desc: 'Semantic similarity with Sentence-BERT' },
    { number: 9, title: 'Learning Roadmap', status: 'completed', desc: '8-Week customized action schedules' },
    { number: 10, title: 'Main Dashboard', status: 'completed', desc: 'Recharts visual analytics & status cards' },
    { number: 11, title: 'Admin Panel', status: 'completed', desc: 'Role management, dataset updates' },
    { number: 12, title: 'Testing & Hardening', status: 'completed', desc: 'E2E and 56+ unit test suite' },
    { number: 13, title: 'Docker Orchestration', status: 'completed', desc: 'Compose production containers' },
    { number: 14, title: 'Documentation & Report', status: 'completed', desc: 'Project report, architecture docs' },
    { number: 15, title: 'AI Mock Interview', status: 'completed', desc: 'Role-based timed interview practice & scoring' },
    { number: 16, title: 'University ERP & Drives', status: 'completed', desc: 'Roster CSV sync, drive eligibility & shortlists' },
  ];

  return (
    <div className="py-10 border-t border-slate-800/80 reveal-on-scroll">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Engineering Roadmap</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Phased Implementation Strategy</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mt-2 sm:mt-0">
            Disciplined iterative delivery: each phase is verified and tested before subsequent modules are added.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {phases.map((phase, idx) => {
            const isCompleted = phase.status === 'completed';
            const isCurrent = phase.status === 'in_progress';
            const delayClass = `reveal-delay-${(idx % 4) + 1}`;
            return (
              <div
                key={phase.number}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] cursor-default reveal-on-scroll ${delayClass} ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 ring-1 ring-emerald-500/10 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5'
                    : isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm shadow-indigo-500/10 hover:border-indigo-400/60'
                    : 'bg-slate-900/30 border-slate-800/60 opacity-70 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    PHASE {phase.number.toString().padStart(2, '0')}
                  </span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1 text-[11px] text-indigo-300 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Next Up
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Circle className="w-3 h-3" />
                      Queued
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white truncate">{phase.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{phase.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
