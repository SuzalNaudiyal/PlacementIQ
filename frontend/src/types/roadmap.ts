export interface TaskItem {
  id: string;
  title: string;
  estimated_hours: number;
  difficulty: string;
  completed: boolean;
  resource_url?: string | null;
}

export interface WeeklyModule {
  week_number: number;
  title: string;
  theme: string;
  badge_color: string;
  target_hours: number;
  focus_skills: string[];
  learning_goals: string[];
  tasks: TaskItem[];
  milestone_deliverable: string;
}

export interface RoadmapResponse {
  target_role_id: string;
  target_role_title: string;
  target_category: string;
  starting_match_percentage: number;
  projected_completion_match: number;
  total_weeks: number;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  missing_critical_count: number;
  missing_important_count: number;
  weeks: WeeklyModule[];
}

export interface GenerateRoadmapRequest {
  role_id: string;
}

export interface ToggleTaskRequest {
  task_id: string;
  completed: boolean;
}
