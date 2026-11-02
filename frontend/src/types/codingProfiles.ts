export interface BadgeItem {
  id: string;
  title: string;
  tier: 'gold' | 'silver' | 'emerald' | 'amber' | 'indigo' | string;
  icon: string;
}

export interface GitHubStats {
  username: string;
  avatar_url?: string;
  public_repos: number;
  stars_received: number;
  followers: number;
  top_languages: string[];
  recent_commits_30d: number;
  account_age_years: number;
  source: string;
}

export interface LeetCodeStats {
  username: string;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  ranking: number;
  acceptance_rate: number;
  contest_rating?: number | null;
  source: string;
}

export interface CodingProfileResponse {
  github_username?: string | null;
  leetcode_username?: string | null;
  github_stats?: GitHubStats | null;
  leetcode_stats?: LeetCodeStats | null;
  code_quality_index: number;
  calibrated_coding_score: number;
  dsa_score_contribution: number;
  git_score_contribution: number;
  badges: BadgeItem[];
  last_synced_at: string;
}

export interface CodingProfileVerifyPayload {
  github_username?: string;
  leetcode_username?: string;
}

