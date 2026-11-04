import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  Trash2,
  X,
  Sparkles,
  BarChart3,
  Layers,
  Brain,
  Volume2,
  Mic,
  Building2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Filter,
  CheckCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import type {
  CohortStatsResponse,
  AdminStudentListItem,
  AdminStudentDetail,
} from '../../types/admin';
import type {
  PlacementDrive,
  EligibleCandidate,
  CreatePlacementDrivePayload,
} from '../../types/erp';
import { adminService } from '../../services/admin';
import { erpService } from '../../services/erp';
import {
  fetchAdminAssessmentSubmissions,
  type AdminAssessmentSubmission,
} from '../../services/assessments';
import { normalizeAudioSource } from '../../utils/audio';

interface AdminDashboardProps {
  initialTab?: 'drives' | 'alerts' | 'directory' | 'analytics' | 'assessments';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'drives' }) => {
  const [activeTab, setActiveTab] = useState<'drives' | 'alerts' | 'directory' | 'analytics' | 'assessments'>(initialTab);
  const [assessmentSubmissions, setAssessmentSubmissions] = useState<AdminAssessmentSubmission[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminAssessmentSubmission | null>(null);
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [stats, setStats] = useState<CohortStatsResponse | null>(null);
  const [students, setStudents] = useState<AdminStudentListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // DCPD Placement Drives State
  const [placementDrives, setPlacementDrives] = useState<PlacementDrive[]>([]);
  const [selectedPlacementDriveId, setSelectedPlacementDriveId] = useState<string | null>(null);
  const [eligibleCandidates, setEligibleCandidates] = useState<EligibleCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(false);
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [candidateBranchFilter, setCandidateBranchFilter] = useState<string>('all');
  const [candidateMinCgpa, setCandidateMinCgpa] = useState<string>('');
  const [exportingShortlist, setExportingShortlist] = useState<boolean>(false);
  const [showCreatePlacementModal, setShowCreatePlacementModal] = useState<boolean>(false);
  const [creatingPlacementDrive, setCreatingPlacementDrive] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // WhatsApp Broadcast state
  const [selectedAlertDriveId, setSelectedAlertDriveId] = useState<string>('');
  const [alertData, setAlertData] = useState<any>(null);
  const [loadingAlert, setLoadingAlert] = useState<boolean>(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // New Placement Drive Form State
  const [newPlacementPayload, setNewPlacementPayload] = useState<CreatePlacementDrivePayload>({
    company_name: '',
    job_role: '',
    ctc_lpa: 14.5,
    location: 'Bangalore / Hybrid',
    min_cgpa: 7.5,
    max_backlogs: 0,
    eligible_branches: ['Computer Science', 'Information Technology'],
    min_coding_score: 70.0,
    application_deadline: '2026-12-31',
    drive_date: '2027-01-15',
    description: '',
  });

  // Filters for Directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedReadiness, setSelectedReadiness] = useState<string>('');
  const [minCgpaFilter, setMinCgpaFilter] = useState<string>('');

  // Modals
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<AdminStudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [exportingCsv, setExportingCsv] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load initial cohort stats & data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, studentsData, pDrives] = await Promise.all([
        adminService.getCohortStats(),
        adminService.getStudentsDirectory(),
        erpService.getDrives().catch(() => []),
      ]);
      setStats(statsData);
      setStudents(studentsData.students);
      setPlacementDrives(pDrives);
      if (pDrives.length > 0) {
        setSelectedPlacementDriveId(pDrives[0].drive_id);
        setSelectedAlertDriveId(pDrives[0].drive_id);
        loadEligibleCandidates(pDrives[0].drive_id);
      }
    } catch (err: any) {
      console.error('Error fetching admin intelligence:', err);
      setError(err?.response?.data?.detail || 'Failed to load institutional analytics. Ensure you are signed in as Administrator.');
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleCandidates = async (driveId: string) => {
    try {
      setLoadingCandidates(true);
      setSelectedPlacementDriveId(driveId);
      const res = await erpService.getEligibleCandidates(driveId);
      setEligibleCandidates(res.candidates);
    } catch (err) {
      console.warn('Failed to load eligible candidates:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const loadDriveAlertData = async (driveId: string) => {
    try {
      setLoadingAlert(true);
      setSelectedAlertDriveId(driveId);
      const data = await erpService.getDriveAlerts(driveId);
      setAlertData(data);
    } catch (err) {
      console.warn('Failed to load drive alert:', err);
    } finally {
      setLoadingAlert(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'alerts' && selectedAlertDriveId) {
      loadDriveAlertData(selectedAlertDriveId);
    }
  }, [activeTab, selectedAlertDriveId]);

  const handleCreatePlacementDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPlacementDrive(true);
    try {
      const created = await erpService.createDrive(newPlacementPayload);
      setShowCreatePlacementModal(false);
      setActionSuccessMsg(`Campus recruitment drive for ${created.company_name} is now live for all students!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      const updatedDrives = await erpService.getDrives();
      setPlacementDrives(updatedDrives);
      if (created.drive_id) {
        loadEligibleCandidates(created.drive_id);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to publish placement drive.');
    } finally {
      setCreatingPlacementDrive(false);
    }
  };

  const handleDeletePlacementDrive = async (driveId: string, companyName: string) => {
    if (!window.confirm(`Are you sure you want to remove the placement drive for ${companyName}?`)) return;
    try {
      await erpService.deleteDrive(driveId);
      setActionSuccessMsg(`Placement drive for ${companyName} removed.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      const updatedDrives = await erpService.getDrives();
      setPlacementDrives(updatedDrives);
      if (selectedPlacementDriveId === driveId && updatedDrives.length > 0) {
        loadEligibleCandidates(updatedDrives[0].drive_id);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to remove placement drive.');
    }
  };

  const handleExportPlacementShortlist = async (driveId: string, company: string) => {
    try {
      setExportingShortlist(true);
      const content = await erpService.exportShortlistCsv(driveId, 'eligible');
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company.toLowerCase().replace(/\s+/g, '_')}_eligible_candidates_shortlist.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setActionSuccessMsg(`Shortlist CSV for ${company} successfully downloaded!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Failed to export shortlist:', err);
    } finally {
      setExportingShortlist(false);
    }
  };

  const loadAssessments = async (type?: string) => {
    try {
      setLoadingAssessments(true);
      const data = await fetchAdminAssessmentSubmissions(type && type !== 'all' ? type : undefined);
      setAssessmentSubmissions(data);
    } catch (err) {
      console.warn('Failed to fetch assessment submissions:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students based on state
  const handleFilterSearch = async () => {
    try {
      const filtered = await adminService.getStudentsDirectory({
        search: searchQuery || undefined,
        branch: selectedBranch || undefined,
        readiness_category: selectedReadiness || undefined,
        min_cgpa: minCgpaFilter ? parseFloat(minCgpaFilter) : undefined,
      });
      setStudents(filtered.students);
    } catch (err) {
      console.error('Error filtering students:', err);
    }
  };

  const handleResetFilters = async () => {
    setSearchQuery('');
    setSelectedBranch('');
    setSelectedReadiness('');
    setMinCgpaFilter('');
    const res = await adminService.getStudentsDirectory();
    setStudents(res.students);
  };

  // View Student Dossier
  const handleViewDossier = async (userId: string) => {
    setSelectedStudentId(userId);
    setLoadingDetail(true);
    try {
      const detail = await adminService.getStudentDrilldown(userId);
      setStudentDetail(detail);
    } catch (err) {
      console.error('Error loading student dossier:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const blob = await adminService.downloadCohortCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Apex_Placement_Cohort_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    } finally {
      setExportingCsv(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Aggregating Institutional Placement Analytics...</h3>
        <p className="text-slate-400 text-sm max-w-md">
          Synthesizing cohort readiness distributions, cross-departmental CGPA metrics, and skill deficit rankings.
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-red-950/30 border border-red-500/30 rounded-2xl text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Administrator Access Required</h3>
        <p className="text-red-200/80 mb-6">{error || 'Unable to access institutional admin panel.'}</p>
        <button
          onClick={loadData}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Distribution chart data
  const pieDistribution = [
    { name: 'High Readiness (≥70%)', value: stats.overview.high_readiness_count, color: '#10B981' },
    { name: 'Moderate (40-69%)', value: stats.overview.moderate_count, color: '#F59E0B' },
    { name: 'At Risk (<40%)', value: stats.overview.at_risk_count, color: '#EF4444' },
  ];

  const branchBarData = stats.branches.map((b) => ({
    name: b.branch.replace('Engineering', 'Eng.').replace('Computer Science & Eng.', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Communication', 'ECE'),
    readiness: b.avg_readiness,
    cgpa: b.avg_cgpa * 10,
    students: b.student_count,
  }));

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Header & Executive Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              University Placement Directorate • DCPD Hub
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              DCPD University Placement Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Upload visiting companies, automate eligibility auditing with verified student skills, export recruiter shortlists with zero Google forms, and broadcast instant WhatsApp drive alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreatePlacementModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload Visiting Company Drive
            </button>

            <button
              onClick={handleExportCsv}
              disabled={exportingCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium transition shadow-sm hover:border-slate-600 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {exportingCsv ? 'Generating CSV...' : 'Export Cohort CSV'}
            </button>
          </div>
        </div>

        {/* Action success alert banner */}
        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-8 border-b border-slate-800 pb-0">
          <button
            onClick={() => {
              setActiveTab('drives');
              if (placementDrives.length > 0 && !selectedPlacementDriveId) {
                loadEligibleCandidates(placementDrives[0].drive_id);
              }
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'drives'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>🏢 Campus Drives & Auto-Shortlisting ({placementDrives.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('alerts');
              if (placementDrives.length > 0 && !selectedAlertDriveId) {
                loadDriveAlertData(placementDrives[0].drive_id);
              }
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>📲 WhatsApp Broadcast Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'directory'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Directory ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Cohort Placement Analytics</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('assessments');
              loadAssessments(testTypeFilter);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'assessments'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>SVAR Voice & Assessment Audits</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COHORT ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cohort Size</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">{stats.overview.total_students}</div>
              <div className="text-xs text-slate-500 mt-1">Registered Final-Year Batch</div>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-emerald-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Placement Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-300">{stats.overview.placement_rate_pct}%</div>
              <div className="text-xs text-emerald-400/80 mt-1">
                {stats.overview.high_readiness_count} Students with ≥ 70% Readiness
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average CGPA</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-300">{stats.overview.avg_cgpa.toFixed(2)}</div>
              <div className="text-xs text-slate-500 mt-1">Cross-Department Benchmark</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg ATS Score</span>
                <BookOpen className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-3xl font-black text-sky-300">{stats.overview.avg_ats_score.toFixed(1)} / 100</div>
              <div className="text-xs text-slate-500 mt-1">Resume Compatibility Audit</div>
            </div>
          </div>

          {/* Visual Benchmark Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Branch Placement Readiness Comparison */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Department Placement Readiness & CGPA</h3>
                  <p className="text-xs text-slate-400">Average Placement Likelihood vs Academic Index</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500" />
                    <span className="text-slate-300">Readiness (%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-slate-300">CGPA (x10)</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="readiness" name="Placement Readiness %" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cgpa" name="Academic Score (x10)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Cohort Readiness Segmentation Pie */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Cohort Readiness Distribution</h3>
                <p className="text-xs text-slate-400 mb-4">ML Placed Probability Categorization</p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                    >
                      {pieDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                {pieDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.value} students</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Curriculum Deficit Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Missing Skills Across Cohort */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Cohort Skill Deficit Leaderboard</h3>
                  <p className="text-xs text-slate-400">Most Frequently Lacking Required Skills</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                  Curriculum Action Items
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {stats.top_missing_skills.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400">#{idx + 1}</span>
                        <span className="text-sm font-semibold text-white">{item.skill}</span>
                      </div>
                      <span className="text-xs font-medium text-amber-400">
                        {item.missing_count} students ({item.frequency_pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.frequency_pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Role Demand Distribution */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Career Aspirations Distribution</h3>
                  <p className="text-xs text-slate-400">Target Role Distribution & Preparedness Level</p>
                </div>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>

              <div className="space-y-3 mt-4">
                {stats.target_roles.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div>
                      <div className="text-sm font-bold text-white">{r.role_title}</div>
                      <div className="text-xs text-slate-500">{r.student_count} Aspirants</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400">{r.avg_readiness}%</div>
                      <div className="text-[11px] text-slate-400">Avg Fit Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search student name, email, roll no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilterSearch()}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Branches</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedReadiness}
                  onChange={(e) => setSelectedReadiness(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Readiness</option>
                  <option value="high">High (≥70%)</option>
                  <option value="moderate">Moderate (40-69%)</option>
                  <option value="at_risk">At Risk (&lt;40%)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFilterSearch}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Filter
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                  title="Reset Filters"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Student Name & Roll</th>
                    <th className="px-5 py-3.5 font-semibold">Department</th>
                    <th className="px-5 py-3.5 font-semibold">CGPA</th>
                    <th className="px-5 py-3.5 font-semibold">Target Career Role</th>
                    <th className="px-5 py-3.5 font-semibold">Readiness Status</th>
                    <th className="px-5 py-3.5 font-semibold">ATS Score</th>
                    <th className="px-5 py-3.5 font-semibold">Roadmap Progress</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((st) => {
                    const probPct = Math.round(st.placement_probability * 100);
                    let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                    let IconComponent = CheckCircle2;
                    if (st.readiness_category === 'Moderate') {
                      badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                      IconComponent = AlertTriangle;
                    } else if (st.readiness_category === 'At Risk') {
                      badgeClass = 'bg-red-500/10 text-red-400 border-red-500/30';
                      IconComponent = XCircle;
                    }

                    return (
                      <tr key={st.user_id} className="hover:bg-slate-850/50 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{st.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{st.roll_number || 'N/A'}</span>
                            <span>•</span>
                            <span className="text-slate-500">{st.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-slate-200">{st.branch}</div>
                          <div className="text-xs text-slate-500">Semester {st.semester}</div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-white">{st.cgpa.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-medium capitalize">
                            {st.target_role.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
                            <IconComponent className="w-3.5 h-3.5" />
                            {probPct}% ({st.readiness_category})
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-sky-400">{st.ats_score.toFixed(0)} / 100</td>
                        <td className="px-5 py-4">
                          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${st.roadmap_progress_pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{st.roadmap_progress_pct.toFixed(0)}% Done</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleViewDossier(st.user_id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {students.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  No students matched your search criteria. Try relaxing your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: DCPD CAMPUS DRIVES & AUTO-ELIGIBLE SHORTLISTING */}
      {activeTab === 'drives' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Drives Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <Building2 className="w-3.5 h-3.5" />
                University Placement Hub • Zero Google Forms
              </div>
              <h2 className="text-xl font-bold text-white">Visiting Company Campus Drives ({placementDrives.length})</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload new visiting recruiters, audit real-time student qualification, and export official HR shortlists.
              </p>
            </div>
            <button
              onClick={() => setShowCreatePlacementModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload Visiting Company
            </button>
          </div>

          {/* Placement Drives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placementDrives.map((drive) => {
              const isSelected = selectedPlacementDriveId === drive.drive_id;
              return (
                <div
                  key={drive.drive_id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-950/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                          {drive.status || 'Active Drive'}
                        </span>
                        <h3 className="text-base font-bold text-white">{drive.company_name}</h3>
                        <p className="text-xs font-semibold text-indigo-300">{drive.job_role}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-400">₹{drive.ctc_lpa} LPA</span>
                        <span className="block text-[10px] text-slate-500">Annual CTC</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 my-2">{drive.description || 'Campus recruitment drive for final year engineering candidates.'}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 my-3">
                      <div>
                        <span className="text-slate-500 block">Min CGPA</span>
                        <span className="text-white font-semibold">≥ {drive.min_cgpa.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Max Backlogs</span>
                        <span className="text-white font-semibold">{drive.max_backlogs} allowed</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Drive Date</span>
                        <span className="text-indigo-300 font-semibold">{drive.drive_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Deadline</span>
                        <span className="text-rose-300 font-semibold">{drive.application_deadline}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 my-2">
                      {drive.eligible_branches.map((b, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {drive.total_eligible_students} Eligible
                      </span>
                      <span className="text-slate-400">
                        {drive.total_applicants} Applied
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => loadEligibleCandidates(drive.drive_id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Eligible Roster</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAlertDriveId(drive.drive_id);
                          setActiveTab('alerts');
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                      <button
                        onClick={() => handleExportPlacementShortlist(drive.drive_id, drive.company_name)}
                        className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
                        <span>HR Shortlist (CSV)</span>
                      </button>
                      <button
                        onClick={() => handleDeletePlacementDrive(drive.drive_id, drive.company_name)}
                        className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                        title="Remove Drive"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Auto-Eligible Candidate Shortlist Section */}
          {selectedPlacementDriveId && (
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative">
              {(() => {
                const curDrive = placementDrives.find((d) => d.drive_id === selectedPlacementDriveId) || placementDrives[0];
                const filteredCandidates = eligibleCandidates.filter((c) => {
                  const q = candidateSearch.toLowerCase().trim();
                  const matchesSearch =
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.skills.some((s) => s.toLowerCase().includes(q));

                  const matchesBranch =
                    candidateBranchFilter === 'all' ||
                    c.branch.toLowerCase().includes(candidateBranchFilter.toLowerCase());

                  const matchesCgpa =
                    !candidateMinCgpa || c.cgpa >= parseFloat(candidateMinCgpa);

                  return matchesSearch && matchesBranch && matchesCgpa;
                });

                return (
                  <div>
                    {/* Header with Export Action */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
                            <GraduationCap className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              Auto-Eligible Student Shortlist: <span className="text-indigo-400">{curDrive?.company_name}</span>
                            </h3>
                            <p className="text-xs text-slate-400">
                              {curDrive?.job_role} • Package: ₹{curDrive?.ctc_lpa} LPA • Min CGPA: {curDrive?.min_cgpa} • Max Backlogs: {curDrive?.max_backlogs}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleExportPlacementShortlist(curDrive.drive_id, curDrive.company_name)}
                          disabled={exportingShortlist || filteredCandidates.length === 0}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>{exportingShortlist ? 'Exporting...' : `Export for ${curDrive?.company_name} HR (CSV)`}</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search student or technical skill (e.g. Python, React)..."
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <select
                          value={candidateBranchFilter}
                          onChange={(e) => setCandidateBranchFilter(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Departments / Branches</option>
                          <option value="Computer Science">Computer Science & Eng.</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics">Electronics & Comm.</option>
                          <option value="AI">AI & Data Science</option>
                          <option value="Mechanical">Mechanical Engineering</option>
                        </select>
                      </div>

                      <div className="relative">
                        <select
                          value={candidateMinCgpa}
                          onChange={(e) => setCandidateMinCgpa(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">All CGPA Cutoffs (Min: {curDrive?.min_cgpa})</option>
                          <option value="8.5">CGPA ≥ 8.5 (High Tier)</option>
                          <option value="8.0">CGPA ≥ 8.0 (Tier 1 Cutoff)</option>
                          <option value="7.5">CGPA ≥ 7.5 (Standard Cutoff)</option>
                        </select>
                      </div>
                    </div>

                    {/* Candidate Table */}
                    {loadingCandidates ? (
                      <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs text-slate-400">Auditing academic records and skill graphs for {curDrive?.company_name}...</p>
                      </div>
                    ) : filteredCandidates.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 border border-slate-800/80 rounded-xl bg-slate-950/40">
                        No candidates matched the criteria or active filters for this recruitment drive.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-950/90 border-b border-slate-800 uppercase tracking-wider text-[11px] text-slate-400 font-semibold">
                            <tr>
                              <th className="px-4 py-3.5">Candidate Name & Roll</th>
                              <th className="px-4 py-3.5">Branch</th>
                              <th className="px-4 py-3.5">CGPA & Backlogs</th>
                              <th className="px-4 py-3.5">Technical Skills Inventory ("Kya Kya Ata Hai")</th>
                              <th className="px-4 py-3.5">Coding Score</th>
                              <th className="px-4 py-3.5">Readiness</th>
                              <th className="px-4 py-3.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                            {filteredCandidates.map((cand) => (
                              <tr key={cand.student_id} className="hover:bg-slate-850/50 transition">
                                <td className="px-4 py-3.5">
                                  <div className="font-bold text-white text-sm">{cand.name}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">{cand.email}</div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="text-slate-300">{cand.branch}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                                      {cand.cgpa.toFixed(2)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      cand.backlogs === 0
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                                    }`}>
                                      {cand.backlogs === 0 ? '0 Backlogs' : `${cand.backlogs} Backlogs`}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 max-w-xs">
                                  <div className="flex flex-wrap gap-1">
                                    {cand.skills.slice(0, 5).map((sk, idx) => (
                                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700/60 text-slate-200">
                                        {sk}
                                      </span>
                                    ))}
                                    {cand.skills.length > 5 && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                                        +{cand.skills.length - 5}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 font-mono text-cyan-300 font-semibold">
                                  {cand.coding_score.toFixed(0)}%
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    {cand.placement_odds}% Odds
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                    cand.has_applied
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                      : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                  }`}>
                                    {cand.has_applied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3 text-blue-400" />}
                                    {cand.application_status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Showing <strong className="text-white">{filteredCandidates.length}</strong> verified eligible candidates out of <strong className="text-white">{eligibleCandidates.length}</strong> total eligible for {curDrive?.company_name}.
                      </span>
                      <span className="text-indigo-300 font-medium">
                        ✨ Pre-qualified via HireMatrix Placement Engine
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WHATSAPP BROADCAST ALERTS FOR DCPD */}
      {activeTab === 'alerts' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Share2 className="w-3.5 h-3.5" />
                DCPD Official Broadcast Dispatcher
              </div>
              <h2 className="text-xl font-bold text-white">WhatsApp & Email Drive Alerts</h2>
              <p className="text-xs text-slate-400 mt-1">
                Generate verified recruitment notices for college class WhatsApp groups. Includes role details, package, criteria, and 1-click apply links without Google Forms.
              </p>
            </div>

            {/* Drive Selector */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedAlertDriveId}
                onChange={(e) => {
                  setSelectedAlertDriveId(e.target.value);
                  loadDriveAlertData(e.target.value);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {placementDrives.map((d) => (
                  <option key={d.drive_id} value={d.drive_id}>
                    {d.company_name} ({d.job_role}) — ₹{d.ctc_lpa} LPA
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingAlert ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Synthesizing WhatsApp circular template...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* WhatsApp Chat Preview Bubble */}
              <div className="lg:col-span-2 bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                      🏛️
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Official DCPD WhatsApp Circular</h4>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        Verified Institutional Broadcast Format
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const text = alertData?.dcpd_broadcast_whatsapp?.text || alertData?.whatsapp_alert?.text || '';
                        navigator.clipboard.writeText(text);
                        setCopiedWhatsApp(true);
                        setTimeout(() => setCopiedWhatsApp(false), 3000);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
                    >
                      {copiedWhatsApp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWhatsApp ? 'Copied!' : 'Copy WhatsApp Text'}</span>
                    </button>

                    <a
                      href={alertData?.dcpd_broadcast_whatsapp?.whatsapp_url || alertData?.whatsapp_alert?.whatsapp_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Web</span>
                    </a>
                  </div>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-[#0b141a] p-5 rounded-xl border border-emerald-500/20 font-sans text-xs leading-relaxed text-slate-200 whitespace-pre-wrap select-all">
                  {alertData?.dcpd_broadcast_whatsapp?.text || alertData?.whatsapp_alert?.text || 'Loading broadcast message...'}
                </div>
              </div>

              {/* DCPD Benefit Dossier */}
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    How this eliminates Google Forms
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">1.</span>
                      <span><strong>No Manual Re-entry</strong>: Students don't need to re-type CGPA, 10th/12th marks, branch, or resume links.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">2.</span>
                      <span><strong>Zero Ineligible Spam</strong>: Only candidates meeting cutoff criteria can apply, saving hours of manual Excel cleaning.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">3.</span>
                      <span><strong>1-Click HR Packaging</strong>: DCPD downloads the verified candidate shortlist directly in the company's preferred format.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">Email Circular</h4>
                  <p className="text-xs text-slate-400 mb-3">Copy formal placement cell notification to send to batch email distribution lists.</p>
                  <button
                    onClick={() => {
                      const text = alertData?.email_alert?.text || alertData?.dcpd_broadcast_whatsapp?.text || '';
                      navigator.clipboard.writeText(text);
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 3000);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedEmail ? 'Copied Circular!' : 'Copy Email Circular'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ASSESSMENT & SVAR VOICE TELEMETRY */}
      {activeTab === 'assessments' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls Banner */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                Institutional Assessment & SVAR Voice Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review candidate aptitude test grades, AI SVAR voice pronunciation scores, and speech transcripts.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'All Tests' },
                { id: 'aptitude_mcq', label: 'Aptitude MCQs' },
                { id: 'svar_grammar', label: 'SVAR Grammar' },
                { id: 'svar_sentence', label: 'SVAR Voice Repeat' },
                { id: 'svar_extempore', label: 'Extempore' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setTestTypeFilter(f.id);
                    loadAssessments(f.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    testTypeFilter === f.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loadingAssessments ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                Loading candidate submission telemetry...
              </div>
            ) : assessmentSubmissions.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                No student assessment records found for this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Test Type</th>
                      <th className="py-3.5 px-4">AI Score</th>
                      <th className="py-3.5 px-4">CEFR / Badge</th>
                      <th className="py-3.5 px-4">Submission Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {assessmentSubmissions.map((sub) => (
                      <tr key={sub.submission_id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3.5 px-4 font-sans">
                          <span className="font-bold text-white block">{sub.student_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{sub.student_email}</span>
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                              {sub.test_type?.replace(/_/g, ' ')}
                            </span>
                            {(sub.audio_data || sub.summary?.has_recorded_audio) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <Mic className="w-2.5 h-2.5" /> Audio Saved
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white text-sm">
                          {sub.headline_score}%
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <span className="text-emerald-400 font-semibold text-xs">
                            {sub.rating_or_badge || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-sans text-xs font-medium transition"
                          >
                            Inspect AI Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Submission Inspection Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative space-y-4">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                    Submission Inspection Dossier
                  </span>
                  <h3 className="text-xl font-bold text-white">{selectedSubmission.student_name}</h3>
                  <p className="text-xs text-slate-400">{selectedSubmission.student_email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Overall Score</span>
                    <span className="text-lg font-bold text-emerald-400">{selectedSubmission.headline_score}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Rating / CEFR</span>
                    <span className="text-lg font-bold text-white">{selectedSubmission.rating_or_badge}</span>
                  </div>
                </div>

                {/* Detailed Summary Fields */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2 text-slate-300 max-h-60 overflow-y-auto">
                  {selectedSubmission.summary?.expected_sentence && (
                    <div>
                      <span className="text-slate-400 block font-sans font-semibold">Expected Prompt:</span>
                      <p className="text-slate-200">"{selectedSubmission.summary.expected_sentence}"</p>
                    </div>
                  )}
                  {selectedSubmission.summary?.spoken_transcript && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-indigo-400 block font-sans font-semibold">Candidate Spoken Audio:</span>
                      <p className="text-emerald-300">"{selectedSubmission.summary.spoken_transcript}"</p>
                    </div>
                  )}
                  {selectedSubmission.audio_data && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-sans font-semibold flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5" />
                          Candidate Voice Recording (Play Audio):
                        </span>
                        <a
                          href={normalizeAudioSource(selectedSubmission.audio_data)}
                          download={`candidate_recording_${selectedSubmission.submission_id}.${selectedSubmission.audio_data.includes('mp4') || selectedSubmission.audio_data.includes('AAAAIGZ0eX') ? 'm4a' : 'webm'}`}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 font-sans"
                        >
                          Download Audio
                        </a>
                      </div>
                      <audio
                        controls
                        src={normalizeAudioSource(selectedSubmission.audio_data)}
                        className="w-full h-9 rounded-lg bg-slate-900 border border-slate-800"
                        preload="metadata"
                      />
                    </div>
                  )}
                  {selectedSubmission.summary?.feedback && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-amber-400 block font-sans font-semibold">AI Evaluation Remarks:</span>
                      <p className="font-sans text-slate-300">{selectedSubmission.summary.feedback}</p>
                    </div>
                  )}
                  {selectedSubmission.summary?.category_breakdown && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 block font-sans font-semibold mb-1">Aptitude Breakdown:</span>
                      <pre className="text-[11px] text-indigo-300">
                        {JSON.stringify(selectedSubmission.summary.category_breakdown, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT DOSSIER MODAL */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudentId(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetail || !studentDetail ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading Student Placement Dossier...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Verified Student Dossier
                  </div>
                  <h2 className="text-2xl font-black text-white">{studentDetail.name}</h2>
                  <p className="text-sm text-slate-400">{studentDetail.email} • Roll: {studentDetail.roll_number || 'N/A'}</p>
                </div>

                {/* Academic & Placement Snapshot Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase">CGPA</span>
                    <div className="text-xl font-bold text-white mt-0.5">{studentDetail.cgpa.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase">Placement Fit</span>
                    <div className="text-xl font-bold text-emerald-400 mt-0.5">
                      {(studentDetail.placement_probability * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase">ATS Score</span>
                    <div className="text-xl font-bold text-sky-400 mt-0.5">{studentDetail.ats_score.toFixed(0)} / 100</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase">Eligible Jobs</span>
                    <div className="text-xl font-bold text-indigo-400 mt-0.5">{studentDetail.matched_jobs_count}</div>
                  </div>
                </div>

                {/* Target Role & Roadmap Progress */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Target Role:</span>
                    <strong className="text-sm text-white capitalize">{studentDetail.target_role.replace(/-/g, ' ')}</strong>
                  </div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-slate-400">Roadmap Milestone Progress</span>
                    <span className="text-indigo-400 font-bold">{studentDetail.roadmap_progress_pct.toFixed(0)}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${studentDetail.roadmap_progress_pct}%` }} />
                  </div>
                </div>

                {/* SHAP Positive & Negative Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths & Positive Signals
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {studentDetail.top_positive_factors.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{typeof f === 'string' ? f : JSON.stringify(f)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Gaps to Address Before Drives
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {studentDetail.missing_skills.length > 0 ? (
                        studentDetail.missing_skills.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>Missing critical skill: <strong>{s}</strong></span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">No critical skill gaps for target role.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Technical Skills Breadth */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Skills Portfolio</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(studentDetail.skills).flatMap(([_, skillList]) =>
                      Array.isArray(skillList) ? skillList : []
                    ).map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-800 text-xs text-indigo-300 border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD VISITING COMPANY RECRUITMENT DRIVE (DCPD) */}
      {showCreatePlacementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCreatePlacementModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Upload Visiting Company Drive</h3>
                <p className="text-xs text-slate-400">
                  Published drives are instantly pushed to the student portal with automated eligibility auditing.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePlacementDrive} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Microsoft, Atlassian"
                    value={newPlacementPayload.company_name}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, company_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Role / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer, Cloud Architect, Data Scientist"
                    value={newPlacementPayload.job_role}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, job_role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CTC Package (₹ LPA) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={newPlacementPayload.ctc_lpa}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, ctc_lpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum CGPA Cutoff *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={newPlacementPayload.min_cgpa}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, min_cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Allowed Backlogs *</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={newPlacementPayload.max_backlogs}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, max_backlogs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Location</label>
                  <input
                    type="text"
                    value={newPlacementPayload.location}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Coding Score Cutoff (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newPlacementPayload.min_coding_score}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, min_coding_score: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Drive Date (Campus Visit) *</label>
                  <input
                    type="date"
                    required
                    value={newPlacementPayload.drive_date}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, drive_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={newPlacementPayload.application_deadline}
                    onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, application_deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Eligible Disciplines / Branches</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Computer Science', 'Information Technology', 'Electronics', 'AI & Data Science', 'Mechanical'].map((branch) => {
                    const isSelected = newPlacementPayload.eligible_branches.includes(branch);
                    return (
                      <button
                        type="button"
                        key={branch}
                        onClick={() => {
                          if (isSelected) {
                            setNewPlacementPayload({
                              ...newPlacementPayload,
                              eligible_branches: newPlacementPayload.eligible_branches.filter((b) => b !== branch),
                            });
                          } else {
                            setNewPlacementPayload({
                              ...newPlacementPayload,
                              eligible_branches: [...newPlacementPayload.eligible_branches, branch],
                            });
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-lg font-medium border transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {branch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description & Hiring Process</label>
                <textarea
                  rows={3}
                  placeholder="Describe online assessment rounds, technical interview rounds, and required tech stack..."
                  value={newPlacementPayload.description || ''}
                  onChange={(e) => setNewPlacementPayload({ ...newPlacementPayload, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePlacementModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPlacementDrive}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {creatingPlacementDrive ? 'Publishing Drive...' : 'Publish to Student Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
