import React from 'react';
import { Brain, Zap, Mic, FileText, Share2, Target, ArrowRight } from 'lucide-react';

interface FeatureGridProps {
  onSelectFeature?: (featureId: string) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onSelectFeature }) => {
  const features = [
    {
      id: 'assessments',
      icon: Brain,
      title: 'Aptitude & SVAR Voice Assessment',
      description: 'Comprehensive screening combining timed Quantitative & Logical MCQs with live SVAR spoken English audio repetition and extempore evaluation.',
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
      badge: 'NEW • Voice AI & MCQs',
      highlight: 'SVAR Pronunciation & Fluency',
    },
    {
      id: 'prediction',
      icon: Zap,
      title: 'ML Placement Predictor & Simulator',
      description: 'Supervised ensemble classification trained on student coding scores, academic consistency, and internship depth to predict readiness with SHAP explainability.',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: 'XGBoost & SHAP',
      highlight: 'Interactive What-If Sliders',
    },
    {
      id: 'interview',
      icon: Mic,
      title: 'Live Voice AI Mock Interviewer',
      description: 'Realistic technical and behavioral interview simulation with speech-to-text transcription, AI voice questioning, and instant response feedback.',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      badge: 'Speech-to-Text AI',
      highlight: 'Role-Specific Technical Rounds',
    },
    {
      id: 'resume',
      icon: FileText,
      title: 'Resume Parser & ATS Auditor',
      description: 'Deep PDF and DOCX analysis extracting candidate skills, projects, and impact metrics with objective ATS scoring and gap remediation.',
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
      badge: 'NLP & spaCy',
      highlight: 'Tier-1 ATS Match Score',
    },
    {
      id: 'outreach',
      icon: Share2,
      title: '1-Click LinkedIn Referral Pitch Generator',
      description: 'Personalized cold messaging and referral request drafts customized for hiring managers and alumni to accelerate interview callbacks.',
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
      badge: 'NEW • Outreach Engine',
      highlight: 'High-Converting Cold Templates',
    },
    {
      id: 'skillgap',
      icon: Target,
      title: '3-Tier Skill Gap & 8-Week Roadmap',
      description: 'Benchmarks your profile against 10+ standard tech roles (SDE, Data Analyst, Cloud DevOps) and builds an 8-week personalized learning action plan.',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'Taxonomy-Driven',
      highlight: 'Critical Skills Radar',
    },
  ];

  return (
    <div className="py-12 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-rose-950/80 text-rose-300 text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>Unified Placement Operating System</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Everything You Need to Get Placed in 2026
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          From first-round aptitude and SVAR voice tests to technical mock interviews and recruiter outreach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          const delayClass = `reveal-delay-${(idx % 6) + 1}`;
          return (
            <div
              key={feature.id}
              onClick={() => onSelectFeature && onSelectFeature(feature.id)}
              className={`p-6 rounded-2xl glass-card glass-card-hover group flex flex-col justify-between cursor-pointer reveal-on-scroll ${delayClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} border shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-300 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">{feature.highlight}</span>
                <span className="text-rose-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
