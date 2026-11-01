import { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SystemHealthBanner } from './components/SystemHealthBanner';
import { FeatureGrid } from './components/FeatureGrid';
import { PhaseTracker } from './components/PhaseTracker';
import { Footer } from './components/Footer';
import { fetchSystemHealth, pingBackend } from './services/api';
import type { HealthResponse } from './types/system';
import { Sparkles, Shield, User, CheckCircle2, ArrowRight } from 'lucide-react';

function DashboardContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Career Intelligence & Placement Readiness SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI Placement Predictor &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Skill Gap Analyzer
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Evaluate placement readiness, parse resumes with NLP, identify missing skills for specific job roles, match against industry opportunities, and follow an explainable 8-week roadmap.
          </p>

          {/* Action Callouts */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            {!isAuthenticated ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Get Started (Sign In / Register)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Session Active • Ready for Student Profile & Resume Intake</span>
              </div>
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
