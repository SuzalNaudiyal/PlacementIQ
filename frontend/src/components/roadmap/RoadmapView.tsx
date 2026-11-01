import { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckSquare,
  BookOpen,
} from 'lucide-react';
import { roadmapService } from '../../services/roadmap';
import type { RoadmapResponse } from '../../types/roadmap';

const ALL_ROLES = [
  { id: 'full-stack-developer', title: 'Full Stack Developer' },
  { id: 'frontend-engineer', title: 'Frontend Engineer' },
  { id: 'backend-engineer', title: 'Backend Engineer' },
  { id: 'data-scientist', title: 'Data Scientist / ML Engineer' },
  { id: 'data-analyst', title: 'Data Analyst' },
  { id: 'devops-cloud-engineer', title: 'DevOps & Cloud Engineer' },
  { id: 'mobile-app-developer', title: 'Mobile App Developer' },
  { id: 'cybersecurity-analyst', title: 'Cybersecurity Analyst' },
  { id: 'qa-automation-engineer', title: 'QA Automation Engineer' },
  { id: 'systems-sde', title: 'Systems Software Engineer' },
];

export function RoadmapView() {
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active / expanded weeks state
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    try {
      setLoading(true);
      setError(null);
      const data = await roadmapService.getRoadmap();
      setRoadmap(data);
    } catch (err: any) {
      console.error('Failed to load roadmap:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch learning roadmap.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitchRole(roleId: string) {
    try {
      setActionLoading(true);
      setError(null);
      const data = await roadmapService.generateRoadmap({ role_id: roleId });
      setRoadmap(data);
      setExpandedWeeks({ 1: true, 2: true });
    } catch (err: any) {
      console.error('Failed to regenerate roadmap:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to switch target role.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleTask(taskId: string, currentCompleted: boolean) {
    if (!roadmap) return;

    // Optimistic UI update
    const nextCompleted = !currentCompleted;
    const updatedWeeks = roadmap.weeks.map((w) => ({
      ...w,
      tasks: w.tasks.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t)),
    }));

    const total = roadmap.total_tasks;
    const completed = updatedWeeks.reduce(
      (acc, w) => acc + w.tasks.filter((t) => t.completed).length,
      0
    );

    setRoadmap({
      ...roadmap,
      weeks: updatedWeeks,
      completed_tasks: completed,
      progress_percentage: Math.round((completed / total) * 1000) / 10,
    });

    try {
      const serverUpdated = await roadmapService.toggleTask({
        task_id: taskId,
        completed: nextCompleted,
      });
      setRoadmap(serverUpdated);
    } catch (err: any) {
      console.error('Failed to toggle task:', err);
      // Revert on error
      await loadRoadmap();
    }
  }

  function toggleWeekAccordion(weekNumber: number) {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNumber]: !prev[weekNumber],
    }));
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'Intermediate':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white">Synthesizing 8-Week Action Roadmap...</h3>
        <p className="text-sm text-slate-400 mt-1">
          Structuring milestones, tasks, and portfolio project deliverables for your target role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phase 9: Personalized 8-Week Preparation Sprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              8-Week Milestone Learning Roadmap
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Curated week-by-week technical curriculum designed to systematically eliminate your critical screening disqualifiers and build an impressive campus placement portfolio.
            </p>

            {roadmap && (
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Target Role: <strong className="text-white">{roadmap.target_role_title}</strong>
                </span>
                <span className="text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Starting Match: <span className="font-mono font-bold text-amber-300">{roadmap.starting_match_percentage}%</span>
                  <span className="text-slate-500">→</span>
                  Projected:{' '}
                  <span className="font-mono font-bold text-emerald-400">
                    {roadmap.projected_completion_match}%
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Role Switcher & Overall Progress */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-5 rounded-3xl border border-slate-800 flex-shrink-0">
            {/* Circular Progress Gauge */}
            {roadmap && (
              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="9"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * roadmap.progress_percentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-black text-white font-mono">
                    {roadmap.progress_percentage}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Done</span>
                </div>
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Switch Target Role:
              </label>
              <select
                value={roadmap?.target_role_id || 'full-stack-developer'}
                onChange={(e) => handleSwitchRole(e.target.value)}
                disabled={actionLoading}
                className="w-full sm:w-48 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>

              {roadmap && (
                <div className="text-[11px] text-slate-400">
                  <span className="font-bold text-emerald-400">{roadmap.completed_tasks}</span> of{' '}
                  <span className="text-slate-300">{roadmap.total_tasks}</span> Tasks Finished
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 8 Weeks Timeline Accordion */}
      {roadmap && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Weekly Milestone Curriculum ({roadmap.weeks.length} Weeks)
            </span>
            <span className="text-xs text-slate-400">
              Click any week to expand/collapse tasks
            </span>
          </div>

          <div className="space-y-3.5">
            {roadmap.weeks.map((week) => {
              const isExpanded = !!expandedWeeks[week.week_number];
              const weekCompletedTasks = week.tasks.filter((t) => t.completed).length;
              const isWeekFullyCompleted = weekCompletedTasks === week.tasks.length && week.tasks.length > 0;

              return (
                <div
                  key={week.week_number}
                  className={`rounded-3xl border transition-all duration-300 ${
                    isWeekFullyCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : isExpanded
                      ? 'bg-slate-900/80 border-slate-700/80 shadow-lg'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Header Row */}
                  <div
                    onClick={() => toggleWeekAccordion(week.week_number)}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Week Badge */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-bold flex-shrink-0 shadow-md ${
                          isWeekFullyCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-tighter">WK</span>
                        <span className="text-base leading-none">{week.week_number}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                            {week.theme}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            ~{week.target_hours} hrs
                          </span>
                          {isWeekFullyCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Week Complete!
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white">{week.title}</h3>
                      </div>
                    </div>

                    {/* Progress count & chevron */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white">
                          {weekCompletedTasks} / {week.tasks.length}
                        </span>
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                          Tasks
                        </span>
                      </div>

                      <button className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-7 pt-2 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-200">
                      {/* Focus Skills */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-bold text-slate-400">Focus Technologies:</span>
                        {week.focus_skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Learning Goals */}
                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          Key Competency Objectives:
                        </span>
                        <ul className="space-y-1 pl-4 text-xs text-slate-400 list-disc">
                          {week.learning_goals.map((goal, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actionable Tasks List */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          Actionable Task Checklist:
                        </span>

                        <div className="space-y-2">
                          {week.tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleToggleTask(task.id, task.completed)}
                              className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                task.completed
                                  ? 'bg-emerald-950/15 border-emerald-500/30 text-slate-400'
                                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start sm:items-center gap-3">
                                <button
                                  type="button"
                                  className="mt-0.5 sm:mt-0 flex-shrink-0 text-slate-400 hover:text-emerald-400 transition"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-slate-600" />
                                  )}
                                </button>
                                <span
                                  className={`text-xs font-medium leading-relaxed ${
                                    task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyBadge(
                                    task.difficulty
                                  )}`}
                                >
                                  {task.difficulty}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {task.estimated_hours}h
                                </span>
                                {task.resource_url && (
                                  <a
                                    href={task.resource_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 text-slate-400 hover:text-indigo-400 transition"
                                    title="Open documentation resource"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Milestone Deliverable */}
                      <div className="p-4 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 rounded-2xl border border-indigo-500/30 flex items-center gap-3 text-xs">
                        <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-white block">
                            Week {week.week_number} Tangible Deliverable:
                          </span>
                          <span className="text-slate-300 mt-0.5 block">
                            {week.milestone_deliverable}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
