/* ── Candidate Schema Types ──────────────────────────────────────────── */

export interface Skill {
  skill_name: string;
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  duration_months: number;
}

export interface CareerEntry {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  duration_months: number;
}

export interface Education {
  university: string;
  degree: string;
  tier: "tier_1" | "tier_2" | "tier_3";
  graduation_year: number;
}

export interface RedrobSignals {
  // Core engagement
  profile_completeness_score?: number;
  signup_date?: string;
  last_active_date?: string;
  open_to_work_flag?: boolean;
  // Activity metrics
  profile_views_received_30d?: number;
  applications_submitted_30d?: number;
  recruiter_response_rate?: number;
  avg_response_time_hours?: number;
  // Assessments
  skill_assessment_scores?: Record<string, number>;
  // Network
  connection_count?: number;
  endorsements_received?: number;
  // Availability
  notice_period_days?: number;
  expected_salary_range_inr_lpa?: { min?: number; max?: number };
  preferred_work_mode?: string;
  willing_to_relocate?: boolean;
  // External signals
  github_activity_score?: number;
  search_appearance_30d?: number;
  saved_by_recruiters_30d?: number;
  // Track record
  interview_completion_rate?: number;
  offer_acceptance_rate?: number;
  // Verification
  verified_email?: boolean;
  verified_phone?: boolean;
  linkedin_connected?: boolean;
  // Legacy fields
  expected_salary_lpa?: number;
  current_salary_lpa?: number;
  [key: string]: unknown;
}

export interface FlexibleSkill {
  name?: string;
  skill_name?: string;
  proficiency?: string;
  proficiency_level?: string;
  duration_months?: number;
}

export interface FlexibleJob {
  title?: string;
  job_title?: string;
  company?: string;
  company_name?: string;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
}

export interface FlexibleEducation {
  degree?: string;
  university?: string;
  institution?: string;
  school?: string;
  tier?: string;
  graduation_year?: string;
}

export interface Candidate {
  candidate_id: string;
  name?: string;
  current_title?: string;
  location?: string;
  total_experience_years?: number;
  skills?: FlexibleSkill[];
  career_history?: FlexibleJob[];
  education?: FlexibleEducation[];
  redrob_signals?: RedrobSignals;
  profile?: {
    name?: string;
    current_title?: string;
    current_company?: string;
    location?: string;
    years_of_experience?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/* ── Ranking Response Types ──────────────────────────────────────────── */

export interface CoreBreakdown {
  experience: number;
  technical_depth: number;
  education: number;
  raw_core: number;
  mass_service_penalty: number;
  penalized_core: number;
}

export interface BehavioralBreakdown {
  modifier: number;
  breakdown: {
    response_rate: number;
    completeness: number;
    open_to_work: boolean;
    open_boost: number;
    recency_factor: number;
    last_active: string;
  };
}

export interface RankedCandidate {
  candidate_id: string;
  rank: number;
  score: number;
  reasoning: string;
  core_breakdown: CoreBreakdown;
  behavioral: BehavioralBreakdown;
  candidate_data: Candidate;
  filtered: boolean;
  filter_reason: string | null;
}

export interface RankingMetadata {
  total_evaluated: number;
  honeypots_purged: number;
  stuffers_flagged: number;
  candidates_scored: number;
  top_returned: number;
  execution_time_ms: number;
}

export interface RankingResponse {
  success: boolean;
  data: {
    metadata: RankingMetadata;
    rankings: RankedCandidate[];
  };
  note?: string;
}
