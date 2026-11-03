import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
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
  MapPin,
  Sparkles,
  BarChart3,
  Layers,
  Brain,
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
  AdminJobItem,
  JobCreateRequest,
} from '../../types/admin';
import { adminService } from '../../services/admin';
import {
  fetchAdminAssessmentSubmissions,
  type AdminAssessmentSubmission,
} from '../../services/assessments';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'directory' | 'jobs' | 'assessments'>('analytics');
  const [assessmentSubmissions, setAssessmentSubmissions] = useState<AdminAssessmentSubmission[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminAssessmentSubmission | null>(null);
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [stats, setStats] = useState<CohortStatsResponse | null>(null);
  const [students, setStudents] = useState<AdminStudentListItem[]>([]);
  const [jobs, setJobs] = useState<AdminJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for Directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedReadiness, setSelectedReadiness] = useState<string>('');
  const [minCgpaFilter, setMinCgpaFilter] = useState<string>('');

  // Modals
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<AdminStudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [exportingCsv, setExportingCsv] = useState<boolean>(false);

  // New Job Form State
  const [newJob, setNewJob] = useState<JobCreateRequest>({
    title: '',
    company: '',
    company_tier: 'Tier 1 Product',
    location: 'Bangalore / Hybrid',
    salary_range: '₹14.0 - 20.0 LPA',
    min_cgpa: 7.5,
    job_type: 'Full-time',
    deadline: '2026-12-31',
    required_skills: ['Python', 'SQL', 'Git'],
    preferred_skills: ['Docker', 'AWS'],
    description: '',
    experience_level: 'Entry Level',
  });
  const [reqSkillInput, setReqSkillInput] = useState<string>('');
  const [submittingJob, setSubmittingJob] = useState<boolean>(false);

  // Load initial cohort stats & data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, studentsData, jobsData] = await Promise.all([
        adminService.getCohortStats(),
        adminService.getStudentsDirectory(),
        adminService.getAdminCampusJobs(),
      ]);
      setStats(statsData);
      setStudents(studentsData.students);
      setJobs(jobsData);
    } catch (err: any) {
      console.error('Error fetching admin intelligence:', err);
      setError(err?.response?.data?.detail || 'Failed to load institutional analytics. Ensure you are signed in as Administrator.');
    } finally {
      setLoading(false);
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

  // Delete Job Drive
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this campus placement drive?')) return;
    try {
      await adminService.deleteCampusJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Error deleting campus job:', err);
    }
  };

  // Add Job Drive
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmittingJob(true);
    try {
      const created = await adminService.createCampusJobDrive(newJob);
      setJobs((prev) => [created, ...prev]);
      setShowJobModal(false);
      setNewJob({
        title: '',
        company: '',
        company_tier: 'Tier 1 Product',
        location: 'Bangalore / Hybrid',
        salary_range: '₹14.0 - 20.0 LPA',
        min_cgpa: 7.5,
        job_type: 'Full-time',
        deadline: '2026-12-31',
        required_skills: ['Python', 'SQL', 'Git'],
        preferred_skills: ['Docker', 'AWS'],
        description: '',
        experience_level: 'Entry Level',
      });
    } catch (err) {
      console.error('Error creating job drive:', err);
      alert('Failed to post campus drive. Please check field requirements.');
    } finally {
      setSubmittingJob(false);
    }
  };

  // Skill tag add/remove helpers
  const addReqSkill = () => {
    if (reqSkillInput.trim() && !newJob.required_skills.includes(reqSkillInput.trim())) {
      setNewJob((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, reqSkillInput.trim()],
      }));
      setReqSkillInput('');
    }
  };
  const removeReqSkill = (s: string) => {
    setNewJob((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((item) => item !== s),
    }));
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
              Institutional Career Intelligence System
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Placement Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Cohort-wide readiness benchmarking, department-level skill gaps, student tracking, and campus drive orchestration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              disabled={exportingCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium transition shadow-sm hover:border-slate-600 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {exportingCsv ? 'Generating CSV...' : 'Export Cohort CSV'}
            </button>

            <button
              onClick={() => setShowJobModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Post Campus Drive
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800 pb-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Cohort Analytics & Skill Deficits
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'directory'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student Directory ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'jobs'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Campus Drives ({jobs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('assessments');
              loadAssessments(testTypeFilter);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'assessments'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            Assessment & SVAR Telemetry
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

      {/* TAB 3: CAMPUS DRIVES */}
      {activeTab === 'jobs' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Active Campus Recruitment Drives</h2>
              <p className="text-xs text-slate-400">Manage placement opportunities and audit eligible applicant pools.</p>
            </div>
            <button
              onClick={() => setShowJobModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              Add Campus Drive
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
                        {job.company_tier}
                      </div>
                      <h3 className="text-base font-bold text-white">{job.title}</h3>
                      <p className="text-sm font-semibold text-slate-300">{job.company}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Drive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 my-2">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 my-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{job.salary_range}</span>
                    <span>•</span>
                    <span>Min CGPA: <strong className="text-white">{job.min_cgpa.toFixed(1)}</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 my-2">
                    {job.required_skills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                        {s}
                      </span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-500">
                        +{job.required_skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Eligible Cohort Pool: <strong className="text-indigo-400 font-bold">{job.eligible_applicants_count} Students</strong>
                  </span>
                  <span className="text-slate-500">Deadline: {job.deadline}</span>
                </div>
              </div>
            ))}
          </div>
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
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'All Tests' },
                { id: 'aptitude_mcq', label: 'Aptitude MCQs' },
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
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                            {sub.test_type?.replace('_', ' ')}
                          </span>
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

      {/* POST NEW CAMPUS DRIVE MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowJobModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-white mb-1">Post Campus Recruitment Drive</h2>
            <p className="text-xs text-slate-400 mb-6">Create a verified hiring opportunity for campus placement evaluation.</p>

            <form onSubmit={handleAddJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graduate SDE-1 / Associate Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Atlassian, Razorpay"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Tier</label>
                  <select
                    value={newJob.company_tier}
                    onChange={(e) => setNewJob({ ...newJob, company_tier: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tier 1 Product">Tier 1 Product</option>
                    <option value="Fintech Unicorn">Fintech Unicorn</option>
                    <option value="Tier 2 Mid-Market">Tier 2 Mid-Market</option>
                    <option value="Mass IT Recruiter">Mass IT Recruiter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="₹12.0 - 18.0 LPA"
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newJob.min_cgpa}
                    onChange={(e) => setNewJob({ ...newJob, min_cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Required Skills Tag Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type skill & press Add (e.g. Python, React)"
                    value={reqSkillInput}
                    onChange={(e) => setReqSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addReqSkill();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addReqSkill}
                    className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-indigo-400 rounded-xl text-xs font-semibold transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {newJob.required_skills.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300">
                      {s}
                      <button type="button" onClick={() => removeReqSkill(s)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe candidate responsibilities and technology focus..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingJob}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {submittingJob ? 'Publishing...' : 'Publish Campus Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
