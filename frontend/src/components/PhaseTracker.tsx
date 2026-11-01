import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export const PhaseTracker: React.FC = () => {
  const phases = [
    { number: 1, title: 'Architecture & Foundation', status: 'completed', desc: 'FastAPI, React, Motor, Docker, Health Check' },
    { number: 2, title: 'Database & Auth', status: 'completed', desc: 'JWT, MongoDB collections, password hashing' },
    { number: 3, title: 'Student Profile', status: 'upcoming', desc: 'Academic, skills, & assessment data forms' },
    { number: 4, title: 'Dataset & ML Pipeline', status: 'upcoming', desc: 'Synthetic/real datasets & model training' },
    { number: 5, title: 'Prediction API', status: 'upcoming', desc: 'Model serving with explainability (SHAP)' },
    { number: 6, title: 'Resume Parser (NLP)', status: 'upcoming', desc: 'spaCy, PyMuPDF, skill extraction' },
    { number: 7, title: 'Skill Gap Engine', status: 'upcoming', desc: '10+ Tech roles & radar gap breakdown' },
    { number: 8, title: 'Job Matching', status: 'upcoming', desc: 'Semantic similarity with Sentence-BERT' },
    { number: 9, title: 'Learning Roadmap', status: 'upcoming', desc: '8-Week customized action schedules' },
    { number: 10, title: 'Main Dashboard', status: 'upcoming', desc: 'Recharts visual analytics & status cards' },
    { number: 11, title: 'Admin Panel', status: 'upcoming', desc: 'Role management, dataset updates' },
    { number: 12, title: 'Testing & Hardening', status: 'upcoming', desc: 'E2E and unit test suites' },
    { number: 13, title: 'Docker Orchestration', status: 'upcoming', desc: 'Compose production containers' },
    { number: 14, title: 'Documentation & Report', status: 'upcoming', desc: 'Project report, architecture docs' },
  ];

  return (
    <div className="py-10 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Engineering Roadmap</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Phased Implementation Strategy</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mt-2 sm:mt-0">
            Disciplined iterative delivery: each phase is verified and tested before subsequent modules are added.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {phases.map((phase) => {
            const isCompleted = phase.status === 'completed';
            const isCurrent = phase.number === 3; // Next up
            return (
              <div
                key={phase.number}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 ring-1 ring-emerald-500/10'
                    : isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'bg-slate-900/30 border-slate-800/60 opacity-70'
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
