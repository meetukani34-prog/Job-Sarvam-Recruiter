"use client";

import { Download, Filter } from "lucide-react";
import type { RankedCandidate } from "@/types/candidate";

interface RankingTableProps {
  candidates: RankedCandidate[];
  onSelectCandidate: (candidate: RankedCandidate) => void;
  isLoading: boolean;
}

function getScoreColor(score: number): string {
  // Amber (low) → Emerald (high)
  if (score >= 85) return "#10b981"; // emerald
  if (score >= 70) return "#34d399"; // emerald-bright
  if (score >= 55) return "#a3e635"; // lime
  if (score >= 40) return "#fbbf24"; // amber-bright
  if (score >= 25) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getScoreGradient(score: number): string {
  if (score >= 70) return "linear-gradient(90deg, #059669, #10b981, #34d399)";
  if (score >= 45) return "linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)";
  return "linear-gradient(90deg, #dc2626, #ef4444, #f87171)";
}

export default function RankingTable({
  candidates,
  onSelectCandidate,
  isLoading,
}: RankingTableProps) {
  const handleDownload = () => {
    if (candidates.length === 0) return;
    
    const headers = ["candidate_id", "rank", "score", "reasoning"];
    const csvRows = [headers.join(",")];
    
    candidates.forEach(c => {
      // Escape quotes for CSV
      const escapedReasoning = c.reasoning ? `"${c.reasoning.replace(/"/g, '""')}"` : '""';
      csvRows.push(`${c.candidate_id},${c.rank},${c.score},${escapedReasoning}`);
    });
    
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\\n"));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "submission.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  if (isLoading) {
    return (
      <div className="glass-card p-6 flex-1">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
            Predictive Ranking Stream
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Predictive Ranking Stream{" "}
          <span className="text-muted font-normal ml-1">
            (Top {candidates.length} Analysts)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground transition-all">
            <Filter size={14} />
          </button>
          <button 
            className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownload}
            disabled={candidates.length === 0}
            title="Download JSON Rankings"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[60px_120px_1fr_1fr] gap-4 px-4 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider border-b border-border-subtle">
        <span>Rank</span>
        <span>Candidate ID</span>
        <span>Match Score</span>
        <span>AI Reasoning</span>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
              <Filter size={24} className="text-muted" />
            </div>
            <p className="text-sm font-medium">No rankings generated yet</p>
            <p className="text-xs mt-1">
              Click &quot;Execute Algorithmic Ranking Engine&quot; to begin
            </p>
          </div>
        ) : (
          candidates.map((candidate, index) => (
            <div
              key={candidate.candidate_id}
              className="table-row grid grid-cols-[60px_120px_1fr_1fr] gap-4 px-4 py-3 items-center"
              onClick={() => onSelectCandidate(candidate)}
              style={{
                animation: `fade-in 0.4s ease-out ${index * 0.03}s both`,
              }}
            >
              {/* Rank */}
              <div className="flex items-center">
                <span
                  className={`text-sm font-bold ${
                    candidate.rank <= 3
                      ? "text-emerald-bright"
                      : candidate.rank <= 10
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  #{candidate.rank.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Candidate ID */}
              <div>
                <span
                  className="font-mono text-xs px-2.5 py-1 rounded-md bg-surface border border-border text-muted-foreground"
                  style={{ letterSpacing: "0.04em" }}
                >
                  {candidate.candidate_id.length > 10
                    ? candidate.candidate_id.slice(0, 10) + "…"
                    : candidate.candidate_id}
                </span>
                {candidate.rank <= 3 && (
                  <span className="ml-2 text-[10px] badge badge-emerald">
                    {candidate.rank === 1
                      ? "Tier 1"
                      : candidate.rank === 2
                      ? "College Boost"
                      : "Fast Track"}
                  </span>
                )}
              </div>

              {/* Score */}
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-semibold w-10 font-mono"
                  style={{ color: getScoreColor(candidate.score) }}
                >
                  {candidate.score.toFixed(0)}%
                </span>
                <div className="flex-1 score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${candidate.score}%`,
                      background: getScoreGradient(candidate.score),
                    }}
                  />
                </div>
              </div>

              {/* Reasoning */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {candidate.reasoning}
                </p>
                {((candidate.candidate_data?.redrob_signals?.recruiter_response_rate ?? 0) > 0.8) && (
                  <span className="badge badge-emerald text-[10px] whitespace-nowrap shrink-0">
                    {Math.round(
                      (candidate.candidate_data?.redrob_signals?.recruiter_response_rate || 0) * 100
                    )}
                    % Response Rate
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
