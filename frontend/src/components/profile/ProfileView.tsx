import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Sliders,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  GitBranch,
  FileDown,
} from 'lucide-react';
import { getStudentProfile, updateStudentProfile, getSkillTaxonomy, downloadPlacementReportPdf } from '../../services/student';
import type { StudentProfile, SkillTaxonomy, ProjectItem, InternshipItem, CertificationItem } from '../../types/student';
import { CodingProfileCard } from './CodingProfileCard';

interface ProfileViewProps {
  onProfileUpdated?: (profile: StudentProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onProfileUpdated }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [taxonomy, setTaxonomy] = useState<SkillTaxonomy | null>(null);
  const [activeTab, setActiveTab] = useState<'academics' | 'skills' | 'experience' | 'assessments' | 'coding'>('academics');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New skill input tracker per category
  const [newSkillInput, setNewSkillInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, taxData] = await Promise.all([
        getStudentProfile(),
        getSkillTaxonomy(),
      ]);
      setProfile(profileData);
      setTaxonomy(taxData);
      setErrorMessage(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      setErrorMessage(error.response?.data?.detail || error.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const updated = await updateStudentProfile({
        personal: profile.personal,
        education: profile.education,
        cgpa: Number(profile.cgpa),
        backlogs: Number(profile.backlogs),
        skills: profile.skills,
        projects: profile.projects,
        internships: profile.internships,
        certifications: profile.certifications,
        assessments: profile.assessments,
      });

      setProfile(updated);
      setSuccessMessage('Profile saved successfully! Completeness updated.');
      if (onProfileUpdated) onProfileUpdated(updated);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      setErrorMessage(error.response?.data?.detail || error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      await downloadPlacementReportPdf(profile?.name || 'Candidate');
      setSuccessMessage('Official Placement Readiness Dossier (PDF) successfully generated & downloaded!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setErrorMessage('Failed to generate official PDF report. Please verify backend connection.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const toggleSkill = (category: keyof StudentProfile['skills'], skill: string) => {
    if (!profile) return;
    const current = profile.skills[category] || [];
    const exists = current.some((s) => s.toLowerCase() === skill.toLowerCase());
    const nextList = exists
      ? current.filter((s) => s.toLowerCase() !== skill.toLowerCase())
      : [...current, skill];

    setProfile({
      ...profile,
      skills: {
        ...profile.skills,
        [category]: nextList,
      },
    });
  };

  const addCustomSkill = (category: keyof StudentProfile['skills']) => {
    const val = (newSkillInput[category] || '').trim();
    if (!val || !profile) return;
    const current = profile.skills[category] || [];
    if (!current.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setProfile({
        ...profile,
        skills: {
          ...profile.skills,
          [category]: [...current, val],
        },
      });
    }
    setNewSkillInput({ ...newSkillInput, [category]: '' });
  };

  const removeSkill = (category: keyof StudentProfile['skills'], skillToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: {
        ...profile.skills,
        [category]: profile.skills[category].filter((s) => s !== skillToRemove),
      },
    });
  };

  // Projects CRUD
  const addProject = () => {
    if (!profile) return;
    const newProj: ProjectItem = {
      title: 'New Project',
      description: 'Brief overview of your project implementation, architecture, and impact.',
      technologies: ['React', 'Python'],
      link: '',
    };
    setProfile({ ...profile, projects: [...profile.projects, newProj] });
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: any) => {
    if (!profile) return;
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, projects: updated });
  };

  const removeProject = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      projects: profile.projects.filter((_, i) => i !== index),
    });
  };

  // Internships CRUD
  const addInternship = () => {
    if (!profile) return;
    const newIntern: InternshipItem = {
      company: 'Tech Company Inc.',
      role: 'Software Development Intern',
      duration_months: 3,
      description: 'Worked on scalable cloud microservices, database queries, and unit test suites.',
    };
    setProfile({ ...profile, internships: [...profile.internships, newIntern] });
  };

  const updateInternship = (index: number, field: keyof InternshipItem, value: any) => {
    if (!profile) return;
    const updated = [...profile.internships];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, internships: updated });
  };

  const removeInternship = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      internships: profile.internships.filter((_, i) => i !== index),
    });
  };

  // Certifications CRUD
  const addCertification = () => {
    if (!profile) return;
    const newCert: CertificationItem = {
      name: 'Cloud Practitioner / Data Specialist',
      issuer: 'AWS / Coursera',
      year: new Date().getFullYear(),
    };
    setProfile({ ...profile, certifications: [...profile.certifications, newCert] });
  };

  const updateCertification = (index: number, field: keyof CertificationItem, value: any) => {
    if (!profile) return;
    const updated = [...profile.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, certifications: updated });
  };

  const removeCertification = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      certifications: profile.certifications.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm">Loading your career profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-400 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
        <p>{errorMessage || 'Failed to load profile.'}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const completeness = profile.completeness_percent;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Completeness Indicator */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {profile.education.degree} • {profile.education.branch}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{profile.email} • {profile.education.university || 'Campus Candidate'}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Completeness Gauge */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${completeness >= 80 ? 'text-emerald-400' : completeness >= 50 ? 'text-amber-400' : 'text-blue-400'} transition-all duration-700`}
                    strokeDasharray={`${completeness}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-white">{completeness}%</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Profile Completeness</p>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">
                  {completeness >= 80 ? '🚀 Placement Ready' : completeness >= 50 ? '⚡ Good Progress' : '📝 Incomplete'}
                </p>
              </div>
            </div>

            {/* Download Official Dossier Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 disabled:opacity-50 transition transform hover:-translate-y-0.5 cursor-pointer"
              title="Download Official 1-Page Placement Dossier (PDF)"
            >
              {downloadingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              {downloadingPdf ? 'Generating PDF...' : 'Download Dossier (PDF)'}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition transform hover:-translate-y-0.5"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Success or Error alert banner */}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-sm animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'academics'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Academics & Personal
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'skills'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Skills & Taxonomy
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'experience'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Projects & Internships
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'assessments'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Assessment Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'coding'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          GitHub & LeetCode
        </button>
      </div>

      {/* Tab 1: Academics & Personal */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              Academic Credentials
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">University / Institute</label>
              <input
                type="text"
                value={profile.education.university}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    education: { ...profile.education, university: e.target.value },
                  })
                }
                placeholder="Apex Institute of Technology"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Degree</label>
                <select
                  value={profile.education.degree}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      education: { ...profile.education, degree: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.E.">B.E.</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="B.Sc CS">B.Sc CS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Graduation Year</label>
                <input
                  type="number"
                  min={2020}
                  max={2035}
                  value={profile.education.graduation_year}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      education: { ...profile.education, graduation_year: parseInt(e.target.value) || 2026 },
                    })
                  }
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Branch / Major</label>
              <input
                type="text"
                value={profile.education.branch}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    education: { ...profile.education, branch: e.target.value },
                  })
                }
                placeholder="Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cumulative CGPA (0 - 10)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profile.cgpa}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        cgpa: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-emerald-400 font-semibold">
                    {profile.cgpa >= 8.5 ? 'Distinction' : profile.cgpa >= 7.0 ? 'First Class' : 'Pass'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={profile.backlogs}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      backlogs: parseInt(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
                    profile.backlogs > 0 ? 'border-amber-500/50 text-amber-300' : 'border-slate-800 text-white'
                  } rounded-xl font-bold text-sm focus:border-emerald-500 focus:outline-none`}
                />
              </div>
            </div>
            {profile.backlogs > 0 && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" /> Note: Tier-1 company placement drives usually require 0 active backlogs.
              </p>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-400" />
              Contact & Location
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Registered Full Name</label>
              <input
                type="text"
                disabled
                value={profile.name}
                className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800/50 rounded-xl text-slate-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Campus Email (Login ID)</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800/50 rounded-xl text-slate-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profile.personal.phone || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    personal: { ...profile.personal, phone: e.target.value },
                  })
                }
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Location / Target City</label>
              <input
                type="text"
                value={profile.personal.location || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    personal: { ...profile.personal, location: e.target.value },
                  })
                }
                placeholder="Bengaluru, Karnataka, India"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skills & Taxonomy */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Industry Skill Taxonomy & Your Stack
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any standard industry skill chip to toggle it in your profile, or type a custom skill below.
                </p>
              </div>
            </div>

            {/* Render 6 skill categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {[
                { key: 'programming' as const, label: 'Programming Languages', color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' },
                { key: 'databases' as const, label: 'Databases & Storage', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
                { key: 'frameworks' as const, label: 'Frameworks & Libraries', color: 'from-purple-500/20 to-pink-500/20 text-purple-400' },
                { key: 'cloud' as const, label: 'Cloud & DevOps', color: 'from-amber-500/20 to-orange-500/20 text-amber-400' },
                { key: 'data_ai' as const, label: 'Data Science & AI', color: 'from-rose-500/20 to-red-500/20 text-rose-400' },
                { key: 'soft_skills' as const, label: 'Professional & Soft Skills', color: 'from-teal-500/20 to-cyan-500/20 text-teal-400' },
              ].map(({ key, label }) => {
                const standardList = (taxonomy?.categories as any)?.[key] || [];
                const activeSkills = profile.skills[key] || [];

                return (
                  <div key={key} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</span>
                      <span className="text-xs text-slate-500 font-mono">({activeSkills.length} selected)</span>
                    </div>

                    {/* Active Selected Badges */}
                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {activeSkills.length === 0 ? (
                        <span className="text-xs text-slate-600 italic">No skills added yet</span>
                      ) : (
                        activeSkills.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                          >
                            {s}
                            <button
                              onClick={() => removeSkill(key, s)}
                              className="hover:text-red-400 transition"
                              title="Remove skill"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Taxonomy Quick Selection Pills */}
                    {standardList.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60">
                        <p className="text-[11px] text-slate-500 mb-1.5">Common options:</p>
                        <div className="flex flex-wrap gap-1">
                          {standardList.map((skillName: string) => {
                            const isSelected = activeSkills.some((s) => s.toLowerCase() === skillName.toLowerCase());
                            return (
                              <button
                                key={skillName}
                                type="button"
                                onClick={() => toggleSkill(key, skillName)}
                                className={`px-2 py-0.5 rounded text-[11px] transition ${
                                  isSelected
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {skillName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add Custom Skill input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder={`Add ${label.toLowerCase()}...`}
                        value={newSkillInput[key] || ''}
                        onChange={(e) => setNewSkillInput({ ...newSkillInput, [key]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomSkill(key);
                          }
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => addCustomSkill(key)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Projects & Internships & Certifications */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          {/* Projects Section */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  Technical Projects ({profile.projects.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Showcase real-world implementations, GitHub repositories, or live deployments.</p>
              </div>
              <button
                onClick={addProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3 relative group">
                  <button
                    onClick={() => removeProject(idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={proj.technologies.join(', ')}
                      onChange={(e) =>
                        updateProject(
                          idx,
                          'technologies',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-indigo-300 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Description & Impact</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Repository / Live Link</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={proj.link || ''}
                        onChange={(e) => updateProject(idx, 'link', e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="w-full pl-2.5 pr-8 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internships Section */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-400" />
                  Internships & Industry Experience ({profile.internships.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Corporate or lab exposure gives significant placement advantage.</p>
              </div>
              <button
                onClick={addInternship}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Internship
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.internships.map((intern, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3 relative group">
                  <button
                    onClick={() => removeInternship(idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition"
                    title="Delete internship"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Company / Organization</label>
                      <input
                        type="text"
                        value={intern.company}
                        onChange={(e) => updateInternship(idx, 'company', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium text-xs focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Duration (Months)</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={intern.duration_months}
                        onChange={(e) => updateInternship(idx, 'duration_months', parseInt(e.target.value) || 3)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium text-xs focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Role Title</label>
                    <input
                      type="text"
                      value={intern.role}
                      onChange={(e) => updateInternship(idx, 'role', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-teal-300 text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Key Contributions</label>
                    <textarea
                      rows={2}
                      value={intern.description}
                      onChange={(e) => updateInternship(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-teal-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Certifications & Badges ({profile.certifications.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Recognized third-party credentials (AWS, Google Cloud, Coursera, HackerRank, etc.)</p>
              </div>
              <button
                onClick={addCertification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Certification
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.certifications.map((cert, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                        placeholder="Certificate Title"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-white text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={cert.issuer || ''}
                        onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                        placeholder="Issuer"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-amber-300 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeCertification(idx)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Assessments & Readiness Benchmarks */}
      {activeTab === 'assessments' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Pre-Placement Readiness Assessment Benchmarks
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your self-evaluated or diagnostic test scores (0 - 100) used by our placement prediction ML model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                key: 'coding_score' as const,
                label: 'Coding & Data Structures',
                desc: 'LeetCode/HackerRank algorithm ability, complexity analysis, problem solving.',
                color: 'accent-emerald-500',
              },
              {
                key: 'aptitude_score' as const,
                label: 'Quantitative & Logical Aptitude',
                desc: 'Numerical reasoning, data interpretation, critical thinking tests.',
                color: 'accent-teal-500',
              },
              {
                key: 'communication_score' as const,
                label: 'Communication & Soft Skills',
                desc: 'Fluency, clarity of thought, presentation, and collaborative communication.',
                color: 'accent-blue-500',
              },
              {
                key: 'technical_interview_score' as const,
                label: 'Mock Technical Interview',
                desc: 'System architecture, core subject depth (OS, DBMS, CN), and live debugging.',
                color: 'accent-purple-500',
              },
            ].map(({ key, label, desc, color }) => {
              const score = profile.assessments[key] || 0;
              const badgeColor =
                score >= 80 ? 'text-emerald-400 bg-emerald-500/10' : score >= 65 ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10';

              return (
                <div key={key} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{label}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-bold font-mono ${badgeColor}`}>
                      {score}/100
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        assessments: {
                          ...profile.assessments,
                          [key]: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className={`w-full h-2 bg-slate-800 rounded-lg cursor-pointer ${color}`}
                  />

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Needs Practice (0-50)</span>
                    <span>Competent (51-75)</span>
                    <span>Industry Ready (76-100)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link to GitHub & LeetCode verification */}
          <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <GitBranch className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Automate Coding Score Calibration</p>
                <p className="text-[11px] text-slate-400">
                  Connect your GitHub & LeetCode handles to calculate your verified Code Quality Index (CQI).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('coding')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition"
            >
              Verify Profiles →
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Verified Coding Profiles (GitHub & LeetCode) */}
      {activeTab === 'coding' && (
        <CodingProfileCard
          onProfileSynced={(res) => {
            if (profile) {
              setProfile({
                ...profile,
                assessments: {
                  ...profile.assessments,
                  coding_score: res.calibrated_coding_score,
                },
              });
              if (onProfileUpdated) {
                onProfileUpdated({
                  ...profile,
                  assessments: {
                    ...profile.assessments,
                    coding_score: res.calibrated_coding_score,
                  },
                });
              }
            }
          }}
        />
      )}
    </div>
  );
};
