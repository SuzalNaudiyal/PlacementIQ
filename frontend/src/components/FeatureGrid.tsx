import React from 'react';
import { Target, FileText, Compass, BarChart3, Briefcase, Cpu } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: 'ML Placement Readiness Engine',
      description: 'Supervised classification trained on student academic records, coding scores, internships, and project breadth to estimate realistic placement readiness with XAI explanations.',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      badge: 'XGBoost & Random Forest',
    },
    {
      icon: FileText,
      title: 'NLP Resume & ATS Analyzer',
      description: 'Multi-format PDF and DOCX parsing using spaCy and PyMuPDF. Extracts skills, education, and achievements with transparent scoring and zero fake vendor claims.',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      badge: 'spaCy & PyMuPDF',
    },
    {
      icon: BarChart3,
      title: 'Skill Gap Intelligence Engine',
      description: 'Interactive radar and gap analysis comparing student profiles against 10+ standard tech roles (Data Analyst, ML Engineer, Backend Developer, etc.).',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'Taxonomy-Driven',
    },
    {
      icon: Compass,
      title: 'Personalized Learning Roadmaps',
      description: 'Generates tailored 8-week action plans addressing critical and important missing skills with step-by-step milestones and progress checkboxes.',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: 'Dynamic Generation',
    },
    {
      icon: Briefcase,
      title: 'Semantic Job Matching',
      description: 'Sentence Transformers & vector similarity to match student profiles with actual opportunities, providing transparent match percentages and skill comparisons.',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      badge: 'Sentence-BERT',
    },
    {
      icon: Cpu,
      title: 'Explainable AI (SHAP / Feature Impact)',
      description: 'Transparent reasoning showing top positive and negative factors driving the readiness estimate rather than treating predictions as a black box.',
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
      badge: 'SHAP Interpretability',
    },
  ];

  return (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Enterprise Architecture Built for Rigorous Evaluation
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Engineered with clean separation of concerns across ML, NLP, FastAPI backend, and React TypeScript frontend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span>Production Grade</span>
                <span className="text-indigo-400 font-medium">Modular Service</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
