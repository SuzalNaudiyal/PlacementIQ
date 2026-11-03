import { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { FeatureGrid } from './components/FeatureGrid';
import { AnimatedHeroShowcase } from './components/AnimatedHeroShowcase';
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
import { CareerCopilotWidget } from './components/copilot/CareerCopilotWidget';
import { Footer } from './components/Footer';
import { fetchSystemHealth, pingBackend } from './services/api';
import type { HealthResponse } from './types/system';
import {
  Shield,
  ShieldCheck,
  User,
  CheckCircle2,
  LayoutDashboard,
  UserCheck,
  Zap,
  FileText,
  Target,
  Briefcase,
  Calendar,
  Mic,
  Share2,
  Brain,
  BarChart3,
  Building2,
  GraduationCap,
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
  | 'companyprep'
  | 'outreach'
  | 'assessments'
  | 'erp'
  | 'admin';

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
    subtitle: 'SVAR Voice, PYQs & AI Mock',
    icon: Brain,
    tools: [
      {
        id: 'assessments',
        label: 'Aptitude & SVAR Voice Assessment',
        shortLabel: 'Aptitude & SVAR',
        icon: Brain,
        color: 'text-indigo-400',
        activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
        badge: 'NEW • PYQs',
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
        id: 'companyprep',
        label: 'Company PYQs & Tier Prep',
        shortLabel: 'Company Prep',
        icon: Building2,
        color: 'text-cyan-400',
        activeBg: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 17: Tier-1 Company PYQs & Cutoff Strategy',
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
    ],
  },
  {
    id: 'placements',
    title: 'Placements & Outreach',
    subtitle: 'Jobs, ATS & LinkedIn',
    icon: Briefcase,
    tools: [
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
        id: 'jobs',
        label: 'Campus Jobs Matcher',
        shortLabel: 'Jobs Match',
        icon: Briefcase,
        color: 'text-amber-400',
        activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 8: Semantic Job Matching Engine',
      },
    ],
  },
  {
    id: 'governance',
    title: 'Governance & ERP',
    subtitle: 'University Drives & Telemetry',
    icon: ShieldCheck,
    tools: [
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
      {
        id: 'erp',
        label: 'University Drive ERP',
        shortLabel: 'Campus ERP',
        icon: GraduationCap,
        color: 'text-violet-400',
        activeBg: 'bg-violet-600 text-white shadow-md shadow-violet-600/30',
        requiresAuth: true,
        phaseLabel: 'Phase 16: Enterprise Placement Cell ERP & Roster',
      },
    ],
  },
];

function getPillarForView(view: ViewId): PillarId {
  for (const pillar of PILLARS) {
    if (pillar.tools.some((t) => t.id === view)) {
      return pillar.id;
    }
  }
  return 'intelligence';
}

function DashboardContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [activePillarId, setActivePillarId] = useState<PillarId>('intelligence');

  const navigateToView = (view: ViewId) => {
    setActiveView(view);
    setActivePillarId(getPillarForView(view));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToolClick = (tool: SubTool) => {
    if ((tool.requiresAuth || tool.requiresAdmin) && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    navigateToView(tool.id);
  };

  const currentPillar = PILLARS.find((p) => p.id === activePillarId) || PILLARS[0];
  const activeTool = PILLARS.flatMap((p) => p.tools).find((t) => t.id === activeView);

  const loadHealthData = useCallback(async () => {
    try {
      const pingResult = await pingBackend();
      setLatency(pingResult.latencyMs);

      const data = await fetchSystemHealth();
      setHealthData(data);
    } catch (err: any) {
      console.warn('Backend probe returned error:', err);
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  const isBackendOnline = healthData !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Subtle Technical Cyber-Grid Texture Overlay */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-40" />

      {/* Navigation Header */}
      <Navbar
        isBackendOnline={isBackendOnline}
        latency={latency}
        onOpenAuth={() => setIsAuthModalOpen(true)}
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
                    {user.role} Session
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    JWT Authenticated
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Candidate: <code className="text-indigo-300 font-mono">{user.email}</code></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">HireMatrix Enterprise Workspace</span>
                </p>
              </div>
            </div>

            {/* Focused Candidate Quick Actions */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <button
                onClick={() => navigateToView('profile')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'profile'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => navigateToView('prediction')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'prediction'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Predictor</span>
              </button>
              <button
                onClick={() => navigateToView('assessments')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'assessments'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Placement Test</span>
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/40 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Clean 4-Pillar Enterprise Navigation Bar */}
        <div className="space-y-3 mb-8">
          {/* Tier 1: 4 Core Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-xl">
            {PILLARS.map((pillar) => {
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
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    isPillarActive
                      ? 'bg-slate-800 text-white shadow-md ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isPillarActive ? 'bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-800/80 text-slate-400'}`}>
                    <PillarIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold truncate leading-tight">{pillar.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isPillarActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                        {pillar.tools.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{pillar.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tier 2: Contextual Sub-Tool Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-900/40 border border-slate-800/60 rounded-xl backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              {currentPillar.tools.map((tool) => {
                const isToolActive = activeView === tool.id;
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isToolActive
                        ? tool.activeBg
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
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
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 leading-none">
                        Admin Req
                      </span>
                    )}
                    {tool.requiresAuth && !tool.requiresAdmin && !isAuthenticated && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 leading-none">
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
                {activeTool?.phaseLabel || 'Architecture & Placement Control'}
              </span>
            </div>
          </div>
        </div>

        {/* View Body */}
        {activeView === 'profile' && isAuthenticated ? (
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
        ) : activeView === 'companyprep' && isAuthenticated ? (
          <CompanyPrepView />
        ) : activeView === 'assessments' && isAuthenticated ? (
          <AssessmentHubView />
        ) : activeView === 'erp' && isAuthenticated ? (
          <UniversityERPView />
        ) : activeView === 'outreach' && isAuthenticated ? (
          <LinkedInOutreachView />
        ) : activeView === 'admin' && isAuthenticated ? (
          <AdminDashboard />
        ) : isAuthenticated ? (
          <UnifiedDashboard onNavigate={(view) => navigateToView(view as ViewId)} />
        ) : (
          <>
            {/* Animated Modern Hero with Interactive Bento Showcase & CSS Keyframes */}
            <AnimatedHeroShowcase
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onNavigateToTool={navigateToView}
              isAuthenticated={isAuthenticated}
            />

            {/* Core Superpowers Feature Grid with Glassmorphic Animations */}
            <FeatureGrid onSelectFeature={(featId) => navigateToView(featId as any)} />
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
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
