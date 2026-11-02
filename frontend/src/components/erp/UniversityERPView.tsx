import React, { useState, useEffect } from 'react';
import {
  Building2,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Users,
  Briefcase,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  Send,
  Loader2,
  DollarSign,
  Calendar,
  GraduationCap,
  Bell,
  Mail,
  Copy,
  ExternalLink,
  Share2,
  Sliders,
} from 'lucide-react';
import { erpService } from '../../services/erp';
import type {
  PlacementDrive,
  StudentDriveEligibility,
  CreatePlacementDrivePayload,
  RosterIngestionReport,
} from '../../types/erp';

export const UniversityERPView: React.FC = () => {

  // Navigation tab: 'drives' | 'alerts' | 'roster_sync'
  const [activeTab, setActiveTab] = useState<'drives' | 'alerts' | 'roster_sync'>('drives');

  // Student drives state
  const [studentDrives, setStudentDrives] = useState<StudentDriveEligibility[]>([]);
  const [adminDrives, setAdminDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drive Alerts state
  const [selectedAlertDriveId, setSelectedAlertDriveId] = useState<string>('drive_google_sde');
  const [alertData, setAlertData] = useState<any>(null);
  const [loadingAlert, setLoadingAlert] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [alertPreferences, setAlertPreferences] = useState<any>({
    email_enabled: true,
    whatsapp_enabled: true,
    min_ctc_lpa: 8.0,
    instant_alerts: true,
  });
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);
  const [testDispatchStatus, setTestDispatchStatus] = useState<string | null>(null);

  // Filters
  const [filterMode, setFilterMode] = useState<'all' | 'eligible' | 'applied'>('all');
  const [expandedDriveId, setExpandedDriveId] = useState<string | null>(null);

  // CSV Ingestion state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [ingestionReport, setIngestionReport] = useState<RosterIngestionReport | null>(null);

  // Schedule Drive Form State
  const [showCreateDrive, setShowCreateDrive] = useState<boolean>(false);
  const [newDrive, setNewDrive] = useState<CreatePlacementDrivePayload>({
    company_name: '',
    job_role: '',
    ctc_lpa: 12.0,
    location: 'Bangalore / Hybrid',
    min_cgpa: 7.5,
    max_backlogs: 0,
    eligible_branches: ['Computer Science', 'Information Technology'],
    min_coding_score: 70.0,
    application_deadline: '2026-12-31',
    drive_date: '2027-01-10',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sDrives, aDrives] = await Promise.all([
        erpService.getStudentDrives().catch(() => []),
        erpService.getDrives().catch(() => []),
      ]);
      setStudentDrives(sDrives);
      setAdminDrives(aDrives);
      if (aDrives.length > 0 && !selectedAlertDriveId) {
        setSelectedAlertDriveId(aDrives[0].drive_id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch placement drive telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'alerts' && selectedAlertDriveId) {
      loadDriveAlert(selectedAlertDriveId);
      loadPreferences();
    }
  }, [activeTab, selectedAlertDriveId]);

  const loadPreferences = async () => {
    try {
      const prefs = await erpService.getAlertPreferences();
      if (prefs) setAlertPreferences(prefs);
    } catch {
      // Ignore
    }
  };

  const loadDriveAlert = async (driveId: string) => {
    try {
      setLoadingAlert(true);
      const data = await erpService.getDriveAlerts(driveId);
      setAlertData(data);
    } catch {
      // Fallback
    } finally {
      setLoadingAlert(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPrefs(true);
      await erpService.updateAlertPreferences(alertPreferences);
      setSuccessMsg('Drive alert preferences saved!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch {
      setError('Failed to update alert preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleDispatchTest = async (channel: 'whatsapp' | 'email' | 'all') => {
    try {
      setTestDispatchStatus(`Dispatching test alert via ${channel.toUpperCase()}...`);
      const res = await erpService.dispatchTestAlert(selectedAlertDriveId, channel);
      setTestDispatchStatus(`✅ ${res.message}`);
      setTimeout(() => setTestDispatchStatus(null), 4000);
    } catch (err: any) {
      setTestDispatchStatus(`⚠️ Dispatch failed: ${err.message}`);
    }
  };

  // Student applies to a drive
  const handleApply = async (driveId: string) => {
    try {
      const res = await erpService.applyToDrive(driveId);
      setSuccessMsg(res.message);
      // Refresh list
      const updated = await erpService.getStudentDrives();
      setStudentDrives(updated);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to submit application.');
    }
  };

  // Handle CSV file selection and upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a valid CSV roster file first.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const report = await erpService.uploadRosterCsv(selectedFile);
      setIngestionReport(report);
      setSuccessMsg(`Successfully processed ${report.total_records_processed} student records!`);
      // Reload drives to refresh cohort counts
      const updatedDrives = await erpService.getDrives();
      setAdminDrives(updatedDrives);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to process CSV roster file.');
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      const content = await erpService.downloadTemplate();
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'university_student_roster_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Template download error:', err);
    }
  };

  // Export Shortlist
  const handleExportShortlist = async (driveId: string, company: string) => {
    try {
      const content = await erpService.exportShortlistCsv(driveId);
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company.toLowerCase()}_shortlisted_candidates.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Export shortlist error:', err);
    }
  };

  // Create Drive
  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await erpService.createDrive(newDrive);
      setShowCreateDrive(false);
      setSuccessMsg(`Placement drive for ${newDrive.company_name} successfully published!`);
      const updated = await erpService.getDrives();
      setAdminDrives(updated);
      const studentUpdated = await erpService.getStudentDrives();
      setStudentDrives(studentUpdated);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create recruitment drive.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered student drives
  const displayedStudentDrives = studentDrives.filter((d) => {
    if (filterMode === 'eligible') return d.is_eligible;
    if (filterMode === 'applied') return d.has_applied;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-indigo-950/60 border border-emerald-500/30 p-6 md:p-8 backdrop-blur-md shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Phase 17: University ERP & Roster Sync
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-500/30">
                <Building2 className="w-3 h-3" />
                Institutional Placement Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              University ERP & Placement Drive Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Automated institutional roster CSV ingestion, semester academic grade synchronization, and real-time student placement drive eligibility auditing.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('drives')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'drives'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Campus Drives ({studentDrives.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Drive Alerts (WhatsApp/Email)
            </button>
            <button
              onClick={() => setActiveTab('roster_sync')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roster_sync'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              ERP Sync & TPO Hub
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: CAMPUS PLACEMENT DRIVES PORTAL                     */}
      {/* ========================================================= */}
      {activeTab === 'drives' && (
        <div className="space-y-6">
          {/* Subheader & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Active Campus Recruitment Drives
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against your live academic profile (CGPA, backlogs, branch, and coding rating).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-500" /> Filter:
              </span>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(['all', 'eligible', 'applied'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition cursor-pointer ${
                      filterMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              Auditing eligibility for active placement drives...
            </div>
          ) : displayedStudentDrives.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-slate-900/40 border border-slate-800 p-8 space-y-2">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No placement drives found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No recruitment drives match your current filter selection. Try switching to "All" or check back when new company drives are published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedStudentDrives.map((drive) => {
                const isExpanded = expandedDriveId === drive.drive_id;
                return (
                  <div
                    key={drive.drive_id}
                    className={`rounded-2xl border transition-all p-6 space-y-4 ${
                      drive.is_eligible
                        ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-950/10'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-90'
                    }`}
                  >
                    {/* Header: Company & CTC */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          {drive.location}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">{drive.company_name}</h3>
                        <p className="text-xs text-indigo-300 font-medium">{drive.job_role}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold text-sm">
                          <DollarSign className="w-3.5 h-3.5" />
                          {drive.ctc_lpa} LPA
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {drive.drive_date}
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        {drive.is_eligible ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Eligible ({drive.predicted_placement_odds}% Odds)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Ineligible (Criteria Shortfall)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedDriveId(isExpanded ? null : drive.drive_id)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        Criteria Audit {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Expanded Criteria Checklist */}
                    {isExpanded && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs animate-in fade-in">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Auditing Reasons:
                        </span>
                        {drive.eligibility_reasons.map((r, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-1.5 ${
                              drive.is_eligible ? 'text-slate-300' : 'text-rose-300'
                            }`}
                          >
                            {drive.is_eligible ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action button */}
                    <div className="pt-2">
                      {drive.has_applied ? (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold text-xs text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Application Submitted • Shortlisted for Round 1
                        </div>
                      ) : drive.is_eligible ? (
                        <button
                          onClick={() => handleApply(drive.drive_id)}
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/20 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          1-Click Apply for Drive
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed text-center"
                        >
                          Ineligible to Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: AUTOMATED WHATSAPP & EMAIL DRIVE ALERTS              */}
      {/* ========================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header & Drive Selector */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-400" />
                Drive Broadcast & Alert Center
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate real-time WhatsApp group broadcasts and responsive HTML email alerts for eligible candidates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-medium">Select Drive:</label>
              <select
                value={selectedAlertDriveId}
                onChange={(e) => setSelectedAlertDriveId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-teal-500"
              >
                {studentDrives.length > 0
                  ? studentDrives.map((sd) => (
                      <option key={sd.drive_id} value={sd.drive_id}>
                        {sd.company_name} — {sd.job_role} (₹{sd.ctc_lpa} LPA)
                      </option>
                    ))
                  : [
                      <option key="google" value="drive_google_sde">
                        Google — SDE I (₹24.5 LPA)
                      </option>,
                      <option key="msft" value="drive_msft_cloud">
                        Microsoft — Cloud Engineer (₹21.0 LPA)
                      </option>,
                    ]}
              </select>
            </div>
          </div>

          {/* Test Status Banner */}
          {testDispatchStatus && (
            <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-teal-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{testDispatchStatus}</span>
            </div>
          )}

          {/* Main 2-Column: Left Preferences & Right Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Preferences Panel */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                Student Alert Preferences
              </h3>

              {/* WhatsApp Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">WhatsApp Alerts</p>
                    <p className="text-[11px] text-slate-400">Direct notifications & broadcasts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertPreferences.whatsapp_enabled}
                  onChange={(e) =>
                    setAlertPreferences({ ...alertPreferences, whatsapp_enabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Email Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Email Notifications</p>
                    <p className="text-[11px] text-slate-400">Detailed drive briefings</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertPreferences.email_enabled}
                  onChange={(e) =>
                    setAlertPreferences({ ...alertPreferences, email_enabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              {/* Min CTC Slider */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Minimum CTC Filter</span>
                  <span className="font-bold text-teal-400">₹{alertPreferences.min_ctc_lpa} LPA+</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="0.5"
                  value={alertPreferences.min_ctc_lpa}
                  onChange={(e) =>
                    setAlertPreferences({ ...alertPreferences, min_ctc_lpa: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-teal-500"
                />
                <p className="text-[10px] text-slate-500">
                  Only alert me for drives meeting or exceeding this threshold.
                </p>
              </div>

              {/* Save Preferences */}
              <button
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-md transition"
              >
                {savingPrefs ? 'Saving...' : 'Save Notification Preferences'}
              </button>

              {/* Test Dispatch Trigger */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Automated Webhooks:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDispatchTest('whatsapp')}
                    className="py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Test WhatsApp
                  </button>
                  <button
                    onClick={() => handleDispatchTest('email')}
                    className="py-2 px-3 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Test Email
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Previews (WhatsApp Bubble + Email Card) */}
            <div className="lg:col-span-2 space-y-6">
              {/* WhatsApp Live Preview */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    WhatsApp Broadcast Template
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (alertData?.whatsapp_alert?.text) {
                          navigator.clipboard.writeText(alertData.whatsapp_alert.text);
                          setCopiedText(true);
                          setTimeout(() => setCopiedText(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>

                    {alertData?.whatsapp_alert?.whatsapp_url && (
                      <a
                        href={alertData.whatsapp_alert.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send to WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="p-4 rounded-2xl bg-[#0b141a] border border-[#202c33] max-w-lg shadow-inner font-sans">
                  {loadingAlert ? (
                    <div className="p-4 flex items-center gap-2 text-emerald-300 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating formatted WhatsApp broadcast...</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#005c4b] text-[#e9edef] text-xs leading-relaxed whitespace-pre-wrap shadow-md">
                      {alertData?.whatsapp_alert?.text ||
                        `🚀 *CAMPUS RECRUITMENT DRIVE ALERT* | *HireMatrix AI*\n\n🏢 Company: Google\n💼 Role: Software Development Engineer\n💰 CTC: ₹24.5 LPA\n🎓 Status: ✅ ELIGIBLE\n⏳ Deadline: 15 December 2026\n\n🔗 Apply: https://hirematrix.ai/drives/drive_google_sde`}
                      <div className="text-[10px] text-right text-emerald-200/80 mt-2 flex items-center justify-end gap-1">
                        <span>Just now</span>
                        <span>✓✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Live Preview */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    Automated Email Dispatch Template
                  </h3>
                  <span className="text-xs text-slate-400">
                    Subject:{' '}
                    <strong className="text-slate-200">
                      {alertData?.email_alert?.subject || 'Campus Recruitment Drive'}
                    </strong>
                  </span>
                </div>

                {/* Rendered HTML Preview Frame */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                    <span>
                      To: <strong className="text-white">Eligible Candidate Roster</strong>
                    </span>
                    <span className="text-emerald-400 font-semibold font-mono">200 OK • Template Ready</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                    <p className="font-bold text-white text-sm">
                      {alertData?.company_name || 'Google'} is Recruiting SDE - I (₹24.5 LPA)
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Your academic credentials match the initial eligibility criteria for the upcoming recruitment drive.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs inline-block">
                        1-Click Apply on Portal
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Includes Verified Academic & Coding Profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: UNIVERSITY ERP ROSTER SYNC & TPO HUB               */}
      {/* ========================================================= */}
      {activeTab === 'roster_sync' && (
        <div className="space-y-8">
          {/* Top Ingestion & Action Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CSV Ingestion Panel */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    University Student Roster CSV Sync
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Batch ingest student roll numbers, branches, semester CGPA, backlogs, and coding metrics.
                  </p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 transition cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition cursor-pointer bg-slate-950/60">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                  <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-xs font-semibold text-white">
                    {selectedFile ? (
                      <span className="text-emerald-400 font-bold">{selectedFile.name} (Ready to sync)</span>
                    ) : (
                      'Click to browse or drag & drop university roster CSV'
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports roll numbers, semester CGPA, backlogs, attendance, and skills ratings.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {selectedFile ? `Selected file: ${selectedFile.name}` : 'Using default verified demo roster'}
                </span>

                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Syncing Academic Roster...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Ingest & Recalculate Profiles
                    </>
                  )}
                </button>
              </div>

              {/* Ingestion Report */}
              {ingestionReport && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-2">
                    <span>Sync Ingestion Summary</span>
                    <span className="text-emerald-400">100% Parsed</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded bg-slate-900">
                      <div className="text-[10px] text-slate-500">Processed</div>
                      <div className="font-bold text-white">{ingestionReport.total_records_processed}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900">
                      <div className="text-[10px] text-slate-500">Successful</div>
                      <div className="font-bold text-emerald-400">
                        {ingestionReport.successful_imports + ingestionReport.updated_records}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-900">
                      <div className="text-[10px] text-slate-500">Failed / Errors</div>
                      <div className="font-bold text-rose-400">{ingestionReport.failed_records}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions / TPO Hub Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  Placement Cell Actions
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Schedule company recruitment drives, configure academic eligibility thresholds, and export candidate shortlists.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setShowCreateDrive(!showCreateDrive)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {showCreateDrive ? 'Close Drive Form' : 'Schedule New Placement Drive'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                <span className="font-bold uppercase tracking-wider block text-[10px]">
                  Institutional Transparency
                </span>
                <p className="text-[11px] text-slate-400">
                  Student eligibility is computed dynamically across 100% of candidate academic records. Zero subjective bias.
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Placement Drive Form Drawer */}
          {showCreateDrive && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                Schedule New Campus Recruitment Drive
              </h3>

              <form onSubmit={handleCreateDrive} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newDrive.company_name}
                    onChange={(e) => setNewDrive({ ...newDrive, company_name: e.target.value })}
                    placeholder="e.g. Atlassian, Adobe, Cisco"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    value={newDrive.job_role}
                    onChange={(e) => setNewDrive({ ...newDrive, job_role: e.target.value })}
                    placeholder="e.g. SDE-1 / Cloud Engineer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Package CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newDrive.ctc_lpa}
                    onChange={(e) => setNewDrive({ ...newDrive, ctc_lpa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Minimum CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newDrive.min_cgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, min_cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Allowed Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={newDrive.max_backlogs}
                    onChange={(e) => setNewDrive({ ...newDrive, max_backlogs: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Drive Date</label>
                  <input
                    type="date"
                    required
                    value={newDrive.drive_date}
                    onChange={(e) => setNewDrive({ ...newDrive, drive_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateDrive(false)}
                    className="px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-white bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                  >
                    Publish Drive & Evaluate Roster
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Drives Administration & Recruiter Export Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Published Recruitment Drives & Recruiter CSV Exporters
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Company & Role</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Eligibility Cutoffs</th>
                    <th className="py-3 px-4">Eligible Students</th>
                    <th className="py-3 px-4">Applicants</th>
                    <th className="py-3 px-4 text-right">Recruiter Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {adminDrives.map((d) => (
                    <tr key={d.drive_id} className="hover:bg-slate-950/40 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {d.company_name}
                        <span className="block text-[11px] font-normal text-indigo-300">{d.job_role}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ₹{d.ctc_lpa} LPA
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        CGPA ≥ {d.min_cgpa} • Backlogs ≤ {d.max_backlogs}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {d.total_eligible_students} Students
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                        {d.total_applicants} Applied
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleExportShortlist(d.drive_id, d.company_name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/60 text-indigo-300 hover:text-white border border-indigo-500/30 hover:bg-indigo-900 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export Shortlist CSV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
