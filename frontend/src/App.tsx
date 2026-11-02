import { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SystemHealthBanner } from './components/SystemHealthBanner';
import { FeatureGrid } from './components/FeatureGrid';
import { PhaseTracker } from './components/PhaseTracker';
import { ProfileView } from './components/profile/ProfileView';
import { PredictionDashboard } from './components/prediction/PredictionDashboard';
import { ResumeAnalyzer } from './components/resume/ResumeAnalyzer';
import { SkillGapAnalyzer } from './components/skillgap/SkillGapAnalyzer';
import { JobMatchingView } from './components/jobs/JobMatchingView';
import { RoadmapView } from './components/roadmap/RoadmapView';
import { UnifiedDashboard } from './components/dashboard/UnifiedDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MockInterviewView } from './components/interview/MockInterviewView';
import { UniversityERPView } from './components/erp/UniversityERPView';
import HireMatrixExplainer from './components/HireMatrixExplainer';
import { Footer } from './components/Footer';
import { fetchSystemHealth, pingBackend } from './services/api';
import type { HealthResponse } from './types/system';
import { Sparkles, Shield, User, CheckCircle2, ArrowRight, LayoutDashboard, UserCheck, Zap, FileText, Target, Briefcase, Calendar, Mic, Building2 } from 'lucide-react';

function DashboardContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'overview' | 'profile' | 'prediction' | 'resume' | 'skillgap' | 'jobs' | 'roadmap' | 'interview' | 'erp' | 'admin' | 'explainer'>('overview');

  const loadHealthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pingResult = await pingBackend();
      setLatency(pingResult.latencyMs);

      const data = await fetchSystemHealth();
      setHealthData(data);
    } catch (err: any) {
      console.warn('Backend probe returned error:', err);
      setError(err?.message || 'Failed to connect to backend API');
      setLatency(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  const isBackendOnline = healthData !== null && !error;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <Navbar
        isBackendOnline={isBackendOnline}
        latency={latency}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* Authenticated Banner when user is logged in */}
        {isAuthenticated && user && (
          <div className="mb-8 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 shadow-lg shadow-indigo-950/20 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                {user.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Welcome, {user.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {user.role} Session
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    JWT Authenticated
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged in as <code className="text-indigo-300">{user.email}</code> • Ready for Phase 3: Student Profile & Career Intelligence
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveView('profile')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'profile'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30'
                }`}
              >
                Profile & Skills
              </button>
              <button
                onClick={() => setActiveView('prediction')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'prediction'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30'
                }`}
              >
                ⚡ Predict Placement
              </button>
              <button
                onClick={() => setActiveView('resume')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'resume'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900 border border-teal-500/30'
                }`}
              >
                📄 Resume & ATS
              </button>
              <button
                onClick={() => setActiveView('skillgap')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'skillgap'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30'
                }`}
              >
                🎯 Skill Gap & Roles
              </button>
              <button
                onClick={() => setActiveView('jobs')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'jobs'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30'
                }`}
              >
                💼 Campus Jobs
              </button>
              <button
                onClick={() => setActiveView('roadmap')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'roadmap'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30'
                }`}
              >
                🗺️ 8-Wk Roadmap
              </button>
              <button
                onClick={() => setActiveView('interview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'interview'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30'
                }`}
              >
                🎙️ Mock Interview
              </button>
              <button
                onClick={() => setActiveView('erp')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeView === 'erp'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30'
                }`}
              >
                🏛️ Campus Drives & ERP
              </button>
              <button
                onClick={() => setActiveView('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeView === 'admin'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30'
                }`}
              >
                ⚙️ Admin Center
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-800/80 gap-3">
          <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Platform Overview & Health
            </button>
            <button
              onClick={() => setActiveView('explainer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'explainer'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              HireMatrix Explainer Tour
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('profile');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'profile'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Student Profile & Skills
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('prediction');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'prediction'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              AI Placement & Simulator
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('resume');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'resume'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Resume Parser & ATS Auditor
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('skillgap');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'skillgap'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-purple-400" />
              Skill Gap & Role Fit
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('jobs');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'jobs'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              Campus Jobs Match
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('roadmap');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'roadmap'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              8-Week Learning Roadmap
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('interview');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'interview'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              AI Mock Interview
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('erp');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'erp'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              University ERP & Drives
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Login Req
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('admin');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              Admin Command Center
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                  Admin Req
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden lg:block">
            {activeView === 'profile' ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Phase 3: Student Profile View
              </span>
            ) : activeView === 'prediction' ? (
              <span className="text-indigo-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                Phase 5: ML Prediction & What-If Engine
              </span>
            ) : activeView === 'resume' ? (
              <span className="text-teal-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                Phase 6: Resume Parser & ATS Engine
              </span>
            ) : activeView === 'skillgap' ? (
              <span className="text-purple-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                Phase 7: 3-Tier Skill Gap & Role Fit Engine
              </span>
            ) : activeView === 'jobs' ? (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Phase 8: Semantic Job Matching Engine
              </span>
            ) : activeView === 'roadmap' ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Phase 9: Personalized 8-Week Learning Roadmap
              </span>
            ) : activeView === 'interview' ? (
              <span className="text-purple-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                Phase 15: AI Mock Interview Simulator
              </span>
            ) : activeView === 'erp' ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Phase 17: University ERP & Roster Sync
              </span>
            ) : (
              <span>Architecture & Multi-Phase Control</span>
            )}
          </div>
        </div>

        {/* View Body */}
        {activeView === 'explainer' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveView('overview')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition cursor-pointer hover:border-slate-700"
              >
                ← Back to Overview
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950">
              <HireMatrixExplainer />
            </div>
          </div>
        ) : activeView === 'profile' && isAuthenticated ? (
          <ProfileView />
        ) : activeView === 'prediction' && isAuthenticated ? (
          <PredictionDashboard />
        ) : activeView === 'resume' && isAuthenticated ? (
          <ResumeAnalyzer />
        ) : activeView === 'skillgap' && isAuthenticated ? (
          <SkillGapAnalyzer />
        ) : activeView === 'jobs' && isAuthenticated ? (
          <JobMatchingView />
        ) : activeView === 'roadmap' && isAuthenticated ? (
          <RoadmapView />
        ) : activeView === 'interview' && isAuthenticated ? (
          <MockInterviewView />
        ) : activeView === 'erp' && isAuthenticated ? (
          <UniversityERPView />
        ) : activeView === 'admin' && isAuthenticated ? (
          <AdminDashboard />
        ) : isAuthenticated ? (
          <UnifiedDashboard onNavigate={(view) => setActiveView(view)} />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Career Intelligence & Placement Readiness SaaS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                HireMatrix{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                  AI
                </span>
              </h1>
              <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-indigo-200">
                AI Placement &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  Skill Gap Analyzer
                </span>
              </h2>

              <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Evaluate placement readiness, parse resumes with NLP, identify missing skills for specific job roles, match against industry opportunities, and follow an explainable 8-week roadmap.
              </p>

              {/* Action Callouts */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <span>Get Started (Sign In / Register)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveView('explainer')}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Watch HireMatrix Tour</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveView('profile')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Go to My Student Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Architecture Stack Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {[
                  'FastAPI 0.110+',
                  'JWT + Bcrypt (RBAC)',
                  'MongoDB Motor',
                  'React 19 + TypeScript',
                  'Tailwind CSS v4',
                  'Docker Ready',
                  'Pydantic v2',
                ].map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Backend Telemetry Widget */}
            <div className="mb-14">
              <SystemHealthBanner
                healthData={healthData}
                loading={loading}
                error={error}
                onRefresh={loadHealthData}
                latency={latency}
              />
            </div>

            {/* Architecture & Feature Breakdown */}
            <FeatureGrid />

            {/* Project Roadmap & Phase Tracker */}
            <PhaseTracker />
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;
