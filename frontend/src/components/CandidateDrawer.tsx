"use client";

import {
  X,
  TrendingUp,
  Building2,
  GraduationCap,
  Clock,
  IndianRupee,
  Activity,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import type { 
  RankedCandidate, 
  FlexibleJob, 
  FlexibleEducation, 
  FlexibleSkill 
} from "@/types/candidate";

interface CandidateDrawerProps {
  candidate: RankedCandidate | null;
  onClose: () => void;
}

export default function CandidateDrawer({
  candidate,
  onClose,
}: CandidateDrawerProps) {
  if (!candidate) return null;

  const data = candidate.candidate_data;
  const signals = data?.redrob_signals;
  const core = candidate.core_breakdown;
  const behavioral = candidate.behavioral;

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="drawer-panel p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wider mb-1">
              Candidate Insight
            </p>
            <p className="text-sm font-mono text-muted-foreground">
              ID: {candidate.candidate_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-red-glow/30 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Top Match Banner */}
        <div className="rounded-xl p-4 mb-5 bg-gradient-to-r from-emerald-glow/10 to-transparent border border-emerald-glow/15">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-emerald text-[10px]">Top Match</span>
            <span className="text-lg font-bold text-foreground">
              Rank #{candidate.rank}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-bright">
            {candidate.score.toFixed(1)}% Match
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data?.current_title} · {data?.location} ·{" "}
            {data?.total_experience_years} YOE
          </p>
        </div>

        {/* Reasoning */}
        <div className="rounded-xl p-4 mb-5 bg-surface border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-emerald-glow" />
            <p className="text-[11px] font-semibold text-emerald-bright uppercase tracking-wider">
              Redrob Behavioral Signals
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            &quot;{candidate.reasoning}&quot;
          </p>
        </div>

        {/* Signal Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <SignalCard
            label="Response Rate"
            value={`${
              signals ? Math.round((signals.recruiter_response_rate ?? 0) > 1 ? (signals.recruiter_response_rate ?? 0) : (signals.recruiter_response_rate ?? 0) * 100) : 0
            }%`}
            icon={TrendingUp}
          />
          <SignalCard
            label="Completeness"
            value={`${
              signals
                ? Math.round((signals.profile_completeness_score ?? 0) > 1 ? (signals.profile_completeness_score ?? 0) : (signals.profile_completeness_score ?? 0) * 100)
                : 0
            }%`}
            icon={CheckCircle2}
          />
          <SignalCard
            label="Notice Period"
            value={`${signals?.notice_period_days ?? 0} days`}
            icon={Clock}
          />
          <SignalCard
            label="Open to Work"
            value={signals?.open_to_work_flag ? "Yes" : "No"}
            icon={signals?.open_to_work_flag ? CheckCircle2 : AlertCircle}
            accent={signals?.open_to_work_flag ? "emerald" : "amber"}
          />
        </div>

        {/* Salary */}
        <div className="rounded-xl p-4 mb-5 bg-surface border border-border">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <IndianRupee size={12} />
            Compensation
          </p>
          <div className="flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-muted">Current</p>
                <p className="text-sm font-semibold text-foreground">
                  {signals?.current_salary_lpa ? `₹${signals.current_salary_lpa.toFixed(1)}L` : "—"}
                </p>
              </div>
              <div className="text-center px-4">
                <span className="text-muted text-xs">→</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted">Expected</p>
                <p className="text-sm font-semibold text-emerald-bright">
                  {signals?.expected_salary_range_inr_lpa 
                    ? `₹${signals.expected_salary_range_inr_lpa.min ?? '?'}L - ${signals.expected_salary_range_inr_lpa.max ?? '?'}L` 
                    : (signals?.expected_salary_lpa ? `₹${signals.expected_salary_lpa.toFixed(1)}L` : "—")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {core && (
          <div className="rounded-xl p-4 mb-5 bg-surface border border-border">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
              Score Breakdown
            </p>
            <div className="flex flex-col gap-2.5">
              <BreakdownRow
                label="Experience Fit"
                value={core.experience}
                weight="30%"
              />
              <BreakdownRow
                label="Technical Depth"
                value={core.technical_depth}
                weight="40%"
              />
              <BreakdownRow
                label="Education"
                value={core.education}
                weight="10%"
              />
              <BreakdownRow
                label="Behavioral Mod."
                value={behavioral?.modifier ?? 0}
                weight="20%"
              />
              {core.mass_service_penalty < 1.0 && (
                <div className="flex items-center gap-2 mt-1 px-2 py-1.5 rounded-lg bg-red-glow/5 border border-red-glow/10">
                  <AlertCircle size={12} className="text-red-glow" />
                  <span className="text-[11px] text-red-glow">
                    Mass-service penalty: {core.mass_service_penalty}×
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career History */}
        {data?.career_history && data.career_history.length > 0 && (
          <div className="rounded-xl p-4 mb-5 bg-surface border border-border">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 size={12} />
              Career Timeline
            </p>
            <div className="flex flex-col gap-3">
              {data.career_history.map((entry: FlexibleJob, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-glow mt-1.5" />
                    {i < (data.career_history?.length || 0) - 1 && (
                      <div className="w-px h-full bg-border min-h-[24px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-xs font-medium text-foreground">
                      {entry.title || entry.job_title || "N/A"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.company || entry.company_name || "N/A"} · {entry.duration_months ? `${Math.round(entry.duration_months / 12)}y ${entry.duration_months % 12}m` : "N/A"}
                    </p>
                    <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {entry.start_date || "?"} → {entry.end_date || "Present"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data?.education && data.education.length > 0 && (
          <div className="rounded-xl p-4 mb-5 bg-surface border border-border">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GraduationCap size={12} />
              Education
            </p>
            <div className="flex flex-col gap-2">
              {data.education.map((edu: FlexibleEducation, i: number) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {edu.degree || "N/A"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {edu.university || edu.institution || edu.school || "N/A"}
                    </p>
                  </div>
                  {edu.tier && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-hover text-muted-foreground border border-border">
                      {edu.tier}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data?.skills && data.skills.length > 0 && (
          <div className="rounded-xl p-4 mb-5 bg-surface border border-border">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity size={12} />
              Top Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {data.skills.slice(0, 12).map((skill: FlexibleSkill, i: number) => {
                const profLevel = (skill.proficiency || skill.proficiency_level || "beginner").toLowerCase();
                const skillName = skill.name || skill.skill_name || "Unknown Skill";
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-surface-hover text-foreground border border-border"
                  >
                    {profLevel === "expert" && (
                      <CheckCircle2 size={10} className="text-emerald-glow" />
                    )}
                    {skillName}
                  </span>
                );
              })}
              {data.skills.length > 12 && (
                <span className="inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-md bg-transparent text-muted-foreground border border-dashed border-border">
                  +{data.skills.length - 12} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Sub Components ──────────────────────────────────────────────────── */

function SignalCard({
  label,
  value,
  icon: Icon,
  accent = "emerald",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: "emerald" | "amber";
}) {
  return (
    <div className="rounded-lg p-3 bg-surface border border-border">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon
          size={12}
          className={
            accent === "emerald" ? "text-emerald-glow" : "text-amber-glow"
          }
        />
        <p className="text-[10px] text-muted">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  const pct = Math.min(Math.round(value * 100), 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-surface-active rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-glow to-emerald-bright transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-10 text-right">
        {pct}%
      </span>
      <span className="text-[10px] text-muted w-8 text-right">{weight}</span>
    </div>
  );
}
