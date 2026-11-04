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
import { CompanyPrepView } from './components/companyprep/CompanyPrepView';
import { LinkedInOutreachView } from './components/outreach/LinkedInOutreachView';
import { AssessmentHubView } from './components/assessments/AssessmentHubView';
import HireMatrixTourModal from './components/HireMatrixTourModal';
import { CareerCopilotWidget } from './components/copilot/CareerCopilotWidget';
import { Footer } from './components/Footer';
import { fetchSystemHealth, pingBackend } from './services/api';
import type { HealthResponse } from './types/system';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  User,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  UserCheck,
  Zap,
  FileText,
  Target,
  Briefcase,
  Calendar,
  Mic,
  Building2,
  BookOpen,
  Share2,
  Brain,
  BarChart3,
  ArrowUp,
} from 'lucide-react';

type ViewId =
  | 'overview'
  | 'profile'
  | 'prediction'
  | 'resume'
  | 'skillgap'
  | 'jobs'
  | 'roadmap'
  | 'interview'
  | 'erp'
  | 'admin'
  | 'explainer'
  | 'company_prep'
  | 'outreach'
  | 'assessments';

type PillarId = 'intelligence' | 'preparation' | 'placements' | 'governance';

interface SubTool {
  id: ViewId;
  label: string;
  shortLabel: string;
  icon: any;
  color: string;
  activeBg: string;
  badge?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  phaseLabel: string;
}

interface Pillar {
  id: PillarId;
  title: string;
  subtitle: string;
  icon: any;
  tools: SubTool[];
}

const PILLARS: Pillar[] = [
  {
    id: 'intelligence',
    title: 'Intelligence & ML',
    subtitle: 'Readiness & Skill Graph',
    icon: BarChart3,
    tools: [
      {
        id: 'overview',
        label: 'Platform Overview & Telemetry',
        shortLabel: 'Overview',
        icon: LayoutDashboard,
        color: 'text-indigo-400',
        activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
        phaseLabel: 'Unified Career Telemetry & System Health',
      },
      {
        id: 'prediction',
        label: 'AI Placement Predictor & Simulator',
        shortLabel: 'Placement Predictor',
        icon: Zap,
        color: 'text-amber-400',
        activeBg: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 5: ML Prediction & What-If Engine',
      },
      {
        id: 'profile',
        label: 'Student Profile & Skill Graph',
        shortLabel: 'Profile & Skills',
        icon: UserCheck,
        color: 'text-emerald-400',
        activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 3: Student Profile & Skill Graph',
      },
      {
        id: 'skillgap',
        label: '3-Tier Skill Gap & Role Fit',
        shortLabel: 'Skill Gap',
        icon: Target,
        color: 'text-purple-400',
        activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 7: 3-Tier Skill Gap & Role Benchmarking',
      },
    ],
  },
  {
    id: 'preparation',
    title: 'Assessments & Practice',
    subtitle: 'SVAR Voice, Aptitude & AI Mock',
    icon: Brain,
    tools: [
      {
        id: 'assessments',
        label: 'Aptitude & SVAR Voice Assessment',
        shortLabel: 'Aptitude & SVAR',
        icon: Brain,
        color: 'text-indigo-400',
        activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
        badge: 'NEW',
        requiresAuth: true,
        phaseLabel: 'Phase 19: SVAR Voice English & Multi-Section Company PYQs',
      },
      {
        id: 'interview',
        label: 'Live AI Mock Interviewer',
        shortLabel: 'Mock Interview',
        icon: Mic,
        color: 'text-purple-400',
        activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 15: AI Voice Mock Interviewer',
      },
      {
        id: 'roadmap',
        label: '8-Week Personalized Roadmap',
        shortLabel: '8-Wk Roadmap',
        icon: Calendar,
        color: 'text-emerald-400',
        activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 9: Personalized 8-Week Learning Roadmap',
      },
      {
        id: 'company_prep',
        label: 'Company Prep Cheat Sheets',
        shortLabel: 'Company Cheat Sheets',
        icon: BookOpen,
        color: 'text-indigo-400',
        activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 18: Tier-1 Company Interview Intelligence',
      },
    ],
  },
  {
    id: 'placements',
    title: 'Placements & Outreach',
    subtitle: 'Campus Drives, Jobs & LinkedIn',
    icon: Briefcase,
    tools: [
      {
        id: 'erp',
        label: 'University ERP & Campus Drives',
        shortLabel: 'Campus Drives & ERP',
        icon: Building2,
        color: 'text-emerald-400',
        activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 17: University ERP & Campus Drives',
      },
      {
        id: 'jobs',
        label: 'Campus Jobs Matcher',
        shortLabel: 'Jobs Match',
        icon: Briefcase,
        color: 'text-amber-400',
        activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 8: Semantic Job Matching Engine',
      },
      {
        id: 'outreach',
        label: 'LinkedIn Referral Pitch Generator',
        shortLabel: 'LinkedIn Pitch',
        icon: Share2,
        color: 'text-blue-400',
        activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-600/30',
        badge: 'NEW',
        requiresAuth: true,
        phaseLabel: 'Phase 20: 1-Click LinkedIn Outreach Engine',
      },
      {
        id: 'resume',
        label: 'Resume Parser & ATS Auditor',
        shortLabel: 'Resume & ATS',
        icon: FileText,
        color: 'text-teal-400',
        activeBg: 'bg-teal-600 text-white shadow-md shadow-teal-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 6: Resume Parser & ATS Engine',
      },
    ],
  },
  {
    id: 'governance',
    title: 'Admin & Governance',
    subtitle: 'Command Center & Architecture Tour',
    icon: ShieldCheck,
    tools: [
      {
        id: 'explainer',
        label: 'HireMatrix Tour & Demo',
        shortLabel: 'Product Tour',
        icon: Sparkles,
        color: 'text-cyan-400',
        activeBg: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30',
        phaseLabel: 'HireMatrix Interactive Architectural Tour',
      },
      {
        id: 'admin',
        label: 'Admin Command Center',
        shortLabel: 'Admin Center',
        icon: Shield,
        color: 'text-rose-400',
        activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-600/30',
        requiresAdmin: true,
        phaseLabel: 'Administration & Assessment Telemetry Hub',
      },
    ],
  },
];

const ADMIN_PILLARS: Pillar[] = [
  {
    id: 'governance',
    title: 'DCPD Placement Directorate',
    subtitle: 'Campus Recruitment & Shortlisting Hub',
    icon: Building2,
    tools: [
      {
        id: 'admin',
        label: 'DCPD Campus Drives & Auto-Shortlisting',
        shortLabel: 'DCPD Command Center',
        icon: Building2,
        color: 'text-indigo-400',
        activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
        requiresAdmin: true,
        phaseLabel: 'University Recruitment Drives, Auto-Shortlisting & WhatsApp Alerts',
      },
      {
        id: 'explainer',
        label: 'Platform Architecture & Tour',
        shortLabel: 'Product Tour',
        icon: Sparkles,
        color: 'text-cyan-400',
        activeBg: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30',
        phaseLabel: 'HireMatrix Enterprise Architecture Tour',
      },
    ],
  },
];

function getPillarForView(view: ViewId, pillars: Pillar[]): PillarId {
  for (const pillar of pillars) {
    if (pillar.tools.some((t) => t.id === view)) {
      return pillar.id;
    }
  }
  return pillars[0]?.id || 'intelligence';
}

function DashboardContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [activePillarId, setActivePillarId] = useState<PillarId>('intelligence');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const currentPillars = user?.role === 'admin' ? ADMIN_PILLARS : PILLARS;

  useEffect(() => {
    if (user?.role === 'admin') {
      setActiveView('admin');
      setActivePillarId('governance');
    }
  }, [user?.role]);

  const navigateToView = (view: ViewId) => {
    setActiveView(view);
    setActivePillarId(getPillarForView(view, currentPillars));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToolClick = (tool: SubTool) => {
    if ((tool.requiresAuth || tool.requiresAdmin) && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    navigateToView(tool.id);
  };

  const currentPillar = currentPillars.find((p) => p.id === activePillarId) || currentPillars[0];
  const activeTool = currentPillars.flatMap((p) => p.tools).find((t) => t.id === activeView);

  const loadHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pingResult = await pingBackend();
      setLatency(pingResult.latencyMs);

      const data = await fetchSystemHealth();
      setHealthData(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to backend service.');
      setLatency(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  // Scroll listener for sticky progress line and back-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      setShowBackToTop(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for smooth scroll-reveal effects on cards and sections
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      if (!elements.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 120);

    return () => clearTimeout(timer);
  }, [activeView]);

  const isBackendOnline = healthData !== null && error === null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Sticky Top Scroll Progress Glow Line */}
      <div
        className="scroll-progress-line"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Background Animated Glow Orbs & Cyber-Grid */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-40" />
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />

      {/* Navigation Header */}
      <Navbar
        isBackendOnline={isBackendOnline}
        latency={latency}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateToTour={() => setIsTourModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10">
        {/* Authenticated Candidate Status Card */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/20 shadow-xl shadow-indigo-950/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-indigo-500/30">
                  {user.role === 'admin' ? <Shield className="w-5 h-5 text-rose-200" /> : <User className="w-5 h-5 text-indigo-100" />}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/50"></span>
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight">Welcome, {user.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                    user.role === 'admin' 
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {user.role === 'admin' ? 'DCPD TPO Administrator' : 'Student Session'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    JWT Authenticated
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  {user.role === 'admin' ? (
                    <>
                      <span className="text-rose-300 font-semibold">University Placement Directorate</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">Apex Institute of Technology</span>
                    </>
                  ) : (
                    <>
                      <span>Candidate: <code className="text-indigo-300 font-mono">{user.email}</code></span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">HireMatrix Enterprise Workspace</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions (Admin vs Student) */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              {user.role === 'admin' ? (
                <>
                  <button
                    onClick={() => navigateToView('admin')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 hover:scale-[1.02] ${
                      activeView === 'admin'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>🏢 Drives & Shortlists</span>
                  </button>
                  <button
                    onClick={() => navigateToView('explainer')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 hover:scale-[1.02] ${
                      activeView === 'explainer'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Product Tour</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigateToView('profile')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 hover:scale-[1.02] ${
                      activeView === 'profile'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => navigateToView('prediction')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 hover:scale-[1.02] ${
                      activeView === 'prediction'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Predictor</span>
                  </button>
                  <button
                    onClick={() => navigateToView('assessments')}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 hover:scale-[1.02] ${
                      activeView === 'assessments'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Assessment</span>
                  </button>
                </>
              )}
              <button
                onClick={logout}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/40 rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Clean Enterprise Navigation Bar */}
        <div className="space-y-3.5 mb-8">
          {/* Tier 1: Core Pillars as Distinct Floating Cards */}
          <div className={`grid gap-3 sm:gap-4 ${
            currentPillars.length === 1
              ? 'grid-cols-1'
              : currentPillars.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {currentPillars.map((pillar) => {
              const isPillarActive = currentPillar.id === pillar.id;
              const PillarIcon = pillar.icon;
              return (
                <button
                  key={pillar.id}
                  onClick={() => {
                    setActivePillarId(pillar.id);
                    if (!pillar.tools.some((t) => t.id === activeView)) {
                      handleToolClick(pillar.tools[0]);
                    }
                  }}
                  className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                    isPillarActive
                      ? 'bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900 border border-indigo-500/60 text-white shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-500/30 -translate-y-0.5'
                      : 'bg-slate-900/75 hover:bg-slate-800/85 border border-slate-800/80 hover:border-slate-700/90 text-slate-300 hover:text-white shadow-md hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:scale-[1.02]'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isPillarActive
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                        : 'bg-slate-800/90 text-indigo-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-300 border border-slate-700/60'
                    }`}
                  >
                    <PillarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-xs sm:text-sm font-bold truncate leading-tight group-hover:text-white">
                        {pillar.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          isPillarActive
                            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-300 border border-slate-700/60'
                        }`}
                      >
                        {pillar.tools.length}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                      {pillar.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tier 2: Contextual Sub-Tool Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-2xl backdrop-blur-md shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              {currentPillar.tools.map((tool) => {
                const isToolActive = activeView === tool.id;
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isToolActive
                        ? `${tool.activeBg} shadow-md scale-[1.02] ring-1 ring-white/10`
                        : 'text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700/80 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-sm'
                    }`}
                  >
                    <ToolIcon className={`w-3.5 h-3.5 ${isToolActive ? 'text-white' : tool.color}`} />
                    <span>{tool.label}</span>
                    {tool.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 leading-none">
                        {tool.badge}
                      </span>
                    )}
                    {tool.requiresAdmin && !isAuthenticated && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 leading-none">
                        Admin Req
                      </span>
                    )}
                    {tool.requiresAuth && !tool.requiresAdmin && !isAuthenticated && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 leading-none">
                        Login Req
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Telemetry Status */}
            <div className="text-xs text-slate-400 hidden lg:flex items-center gap-2 pr-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-300">
                {activeTool?.phaseLabel || 'Architecture & Multi-Phase Control'}
              </span>
            </div>
          </div>
        </div>

        {/* View Body */}
        {activeView === 'explainer' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateToView('overview')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition cursor-pointer hover:border-slate-700"
              >
                ← Back to Overview
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950">
              <HireMatrixTourModal isOpen={true} onClose={() => navigateToView('overview')} />
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
        ) : activeView === 'company_prep' && isAuthenticated ? (
          <CompanyPrepView />
        ) : activeView === 'assessments' && isAuthenticated ? (
          <AssessmentHubView />
        ) : activeView === 'outreach' && isAuthenticated ? (
          <LinkedInOutreachView />
        ) : activeView === 'admin' && isAuthenticated ? (
          <AdminDashboard />
        ) : isAuthenticated ? (
          <UnifiedDashboard onNavigate={(view) => navigateToView(view as ViewId)} />
        ) : (
          <>
            {/* Main Authentic Hero Section: HireMatrix AI */}
            <div className="max-w-4xl w-full mx-auto mb-14 relative z-10 flex flex-col items-center text-center">
              {/* Row 1: Pill Badge */}
              <div className="mb-5 flex justify-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-sm backdrop-blur-md animate-float animate-badge-sweep">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Career Intelligence & Placement Readiness SaaS</span>
                </div>
              </div>

              {/* Row 2: Glowing Dynamic Hero Title with Aura & Transition */}
              <div className="relative flex justify-center items-center w-full my-3">
                <div className="title-aura" aria-hidden="true" />
                <h1 className="relative text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight hero-glow-fx text-center">
                  <span className="hero-title-gradient hover:scale-[1.02] transition-transform duration-300 cursor-default select-none">
                    HireMatrix
                  </span>{' '}
                  <span className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/25 to-pink-500/20 border border-indigo-400/40 shadow-lg shadow-indigo-500/30 backdrop-blur-md align-middle text-2xl sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 animate-text-shimmer">
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    AI
                  </span>
                </h1>
              </div>

              {/* Row 3: Subtitle */}
              <h2 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-indigo-200 text-center">
                AI Placement &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  Skill Gap Analyzer
                </span>
              </h2>

              {/* Row 4: Description */}
              <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto text-center leading-relaxed">
                Evaluate placement readiness, parse resumes with NLP, identify missing skills for specific job roles, match against industry opportunities, and follow an explainable 8-week roadmap.
              </p>

              {/* Row 5: Action Callouts */}
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
                      onClick={() => setIsTourModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Watch HireMatrix Tour</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigateToView('profile')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Go to My Student Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Row 6: Key Feature Highlights / Value Propositions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-7 max-w-2xl">
                {[
                  { label: 'Explainable TreeSHAP ML', icon: '🎯', color: 'border-indigo-500/30 text-indigo-200 bg-indigo-950/30' },
                  { label: 'SVAR Voice AI & Aptitude', icon: '🎙️', color: 'border-cyan-500/30 text-cyan-200 bg-cyan-950/30' },
                  { label: 'Zero Google Forms', icon: '🏢', color: 'border-emerald-500/30 text-emerald-200 bg-emerald-950/30' },
                  { label: '1-Click Campus Apply', icon: '⚡', color: 'border-amber-500/30 text-amber-200 bg-amber-950/30' },
                  { label: 'Real-Time Recruiter Shortlists', icon: '📊', color: 'border-purple-500/30 text-purple-200 bg-purple-950/30' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] shadow-sm cursor-default ${item.color}`}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Backend Telemetry Widget */}
            <div className="mb-14 reveal-on-scroll">
              <SystemHealthBanner
                healthData={healthData}
                loading={loading}
                error={error}
                onRefresh={loadHealthData}
                latency={latency}
              />
            </div>

            {/* Architecture & Feature Breakdown */}
            <FeatureGrid onSelectFeature={(featId) => navigateToView(featId as any)} />

            {/* Project Roadmap & Phase Tracker */}
            <PhaseTracker />
          </>
        )}
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          className="back-to-top-btn flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 text-indigo-300 hover:text-white shadow-xl shadow-indigo-950/40 backdrop-blur-md text-xs font-semibold cursor-pointer animate-in fade-in slide-in-from-bottom-2 hover:scale-105"
        >
          <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Top</span>
        </button>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 60-Second Interactive Tour Video Modal (Marketing / Public Access) */}
      <HireMatrixTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        autoPlay={true}
      />

      {/* AI Placement Career Copilot Floating Chatbot */}
      <CareerCopilotWidget studentName={user?.name} />

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
