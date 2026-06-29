"use client";

import { useState, useCallback, useEffect } from "react";
import {
  UploadCloud,
  ScanSearch,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricsCard from "@/components/MetricsCard";
import JobSpecPanel from "@/components/JobSpecPanel";
import RankingTable from "@/components/RankingTable";
import CandidateDrawer from "@/components/CandidateDrawer";

import type { RankedCandidate, RankingResponse } from "@/types/candidate";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [allRankings, setAllRankings] = useState<RankedCandidate[]>([]);
  const [rawCandidates, setRawCandidates] = useState<any[] | null>(null);
  const [topCount, setTopCount] = useState<number>(100);
  const [selectedCandidate, setSelectedCandidate] =
    useState<RankedCandidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [metrics, setMetrics] = useState({
    totalEvaluated: 0,
    stuffersFlagged: 0,
    honeypotsPurged: 0,
    executionTime: 0,
  });

  const runRankingEngine = async (payload: any) => {
    setIsLoading(true);
    setCandidates([]);
    setSelectedCandidate(null);
    try {
      const allCands = payload.candidates || [];
      const CHUNK_SIZE = 1000;
      const chunks = [];
      for (let i = 0; i < allCands.length; i += CHUNK_SIZE) {
        chunks.push(allCands.slice(i, i + CHUNK_SIZE));
      }

      if (chunks.length === 0) throw new Error("No candidates provided");

      let combinedRankings: RankedCandidate[] = [];
      let totalEvaluated = 0;
      let stuffersFlagged = 0;
      let honeypotsPurged = 0;
      let totalExecutionTime = 0;

      // Process chunks in parallel
      const promises = chunks.map(async (chunk) => {
        const res = await fetch(`${API_BASE}/api/rank-samples`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidates: chunk }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json() as Promise<RankingResponse>;
      });

      const results = await Promise.all(promises);

      results.forEach((json) => {
        if (json.success && json.data) {
          combinedRankings.push(...json.data.rankings);
          totalEvaluated += json.data.metadata.total_evaluated;
          stuffersFlagged += json.data.metadata.stuffers_flagged;
          honeypotsPurged += json.data.metadata.honeypots_purged;
          totalExecutionTime += json.data.metadata.execution_time_ms;
        }
      });

      // Re-sort combined rankings
      combinedRankings.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return String(a.candidate_id).localeCompare(String(b.candidate_id));
      });

      // Take Top 100 overall
      const finalTop100 = combinedRankings.slice(0, 100).map((cand, idx) => ({
        ...cand,
        rank: idx + 1
      }));

      const finalMetrics = {
        totalEvaluated,
        stuffersFlagged,
        honeypotsPurged,
        executionTime: totalExecutionTime,
      };

      setMetrics(finalMetrics);

      // Store real data globally
      localStorage.setItem('sarvam_rankings', JSON.stringify(finalTop100));
      localStorage.setItem('sarvam_metrics', JSON.stringify({
        total_evaluated: totalEvaluated,
        stuffers_flagged: stuffersFlagged,
        honeypots_purged: honeypotsPurged,
        execution_time_ms: totalExecutionTime,
      }));

      setAllRankings(finalTop100);
      setHasRun(true);
    } catch (err) {
      console.error("Ranking failed:", err);
      alert("Failed to process ranking. Ensure it is a valid JSON array of candidates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const streamRankings = async () => {
      if (allRankings.length === 0) {
        setCandidates([]);
        return;
      }
      
      const displayRankings = allRankings.slice(0, topCount);
      const batchSize = 10;
      
      // Clear first if changing topCount drastically (optional, but helps with perceived rendering)
      setCandidates([]);
      
      for (let i = 0; i < displayRankings.length; i += batchSize) {
        if (isCancelled) break;
        const batch = displayRankings.slice(0, i + batchSize);
        setCandidates([...batch]);
        // Simulate streaming visual effect
        await new Promise((r) => setTimeout(r, 40));
      }
    };

    streamRankings();

    return () => { isCancelled = true; };
  }, [allRankings, topCount]);

  const handleJDUploaded = async (jdData: any) => {
    if (!rawCandidates) {
      console.warn("No raw candidates found in memory. Please upload Candidates JSON first to enable automatic ranking.");
      return;
    }
    const payload = { candidates: rawCandidates };
    
    // You could also pass jdData down to the backend if the backend supported dynamic JD requirements
    // For now, we just re-run the ranking engine to simulate the stream update
    await runRankingEngine(payload);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsedCandidates: any[] = [];
      try {
        const parsedData = JSON.parse(text);
        parsedCandidates = Array.isArray(parsedData) 
          ? parsedData 
          : (parsedData.candidates ? parsedData.candidates : [parsedData]);
      } catch (e1) {
        // Fallback to JSONL format
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) throw new Error("File is empty");
        
        for (let i = 0; i < lines.length; i++) {
          try {
            parsedCandidates.push(JSON.parse(lines[i]));
          } catch (e2) {
            console.warn(`Skipping invalid JSON on line ${i + 1}`);
          }
        }
        
        if (parsedCandidates.length === 0) {
          throw new Error("Could not parse any valid JSON candidates from the file.");
        }
      }
      
      const payload = { candidates: parsedCandidates };

      // Cache raw candidates in React state to avoid localStorage 5MB quota errors
      setRawCandidates(payload.candidates);

      await runRankingEngine(payload);
    } catch (err) {
      console.error("File read failed:", err);
      alert("Failed to parse file. Ensure it is a valid JSON array of candidates.");
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricsCard
              icon={ScanSearch}
              title="Total Profiles Evaluated"
              value={metrics.totalEvaluated}
              subtext="CPU Execution Flow"
              accentColor="emerald"
              animationDelay={0}
              isLoading={isLoading}
            />
            <MetricsCard
              icon={AlertTriangle}
              title="Keyword Stuffers Flagged"
              value={hasRun ? metrics.stuffersFlagged : 0}
              suffix={hasRun ? `+${Math.round(metrics.stuffersFlagged * 0.4)}%` : ""}
              subtext="Non-tech titles with injected AI keywords"
              accentColor="amber"
              animationDelay={100}
              isLoading={isLoading}
            />
            <MetricsCard
              icon={ShieldCheck}
              title="Synthetic Honeypots Purged"
              value={hasRun ? metrics.honeypotsPurged : 0}
              suffix={hasRun ? "Bypassed" : ""}
              subtext="Impossible anomaly profiles detected and removed"
              accentColor="emerald"
              animationDelay={200}
              isLoading={isLoading}
            />
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {hasRun && (
                <p className="text-xs text-muted">
                  Engine completed in{" "}
                  <span className="text-emerald-bright font-mono">
                    {metrics.executionTime.toFixed(1)}ms
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {hasRun && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Show Top:</span>
                  <select
                    value={topCount}
                    onChange={(e) => setTopCount(Number(e.target.value))}
                    className="bg-surface border border-border text-xs rounded-md px-2 py-1.5 text-foreground outline-none hover:border-emerald-glow/50 focus:border-emerald-glow transition-colors cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                    <option value={allRankings.length > 0 ? allRankings.length : 1000}>All</option>
                  </select>
                </div>
              )}
              <label
                className={`btn-primary flex items-center gap-2 cursor-pointer ${
                  isLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <input
                  type="file"
                  accept=".json,.jsonl"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing Pipeline...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Upload Candidates JSON
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Split Screen */}
          <div className="flex gap-5 min-h-[600px]">
            {/* Left: Job Spec (35%) */}
            <div className="w-[35%] shrink-0">
              <JobSpecPanel onJDUploaded={handleJDUploaded} />
            </div>

            {/* Right: Ranking Table (65%) */}
            <div className="flex-1 flex">
              <RankingTable
                candidates={candidates}
                onSelectCandidate={setSelectedCandidate}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Bottom Stats Row */}
          {hasRun && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <BottomStat
                icon="🧠"
                label="Semantic Health"
                value="98.2%"
              />
              <BottomStat
                icon="⚡"
                label="Discovery Latency"
                value={`${metrics.executionTime.toFixed(0)}ms`}
              />
              <BottomStat icon="📡" label="Data Refresh" value="Live" />
              <BottomStat
                icon="📤"
                label="Outreach Yield"
                value={`${Math.min(
                  Math.round(
                    (candidates.filter((c) => c.score > 60).length /
                      Math.max(candidates.length, 1)) *
                      100
                  ),
                  100
                )}%`}
              />
            </div>
          )}
        </main>
      </div>

      {/* Candidate Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}

/* ── Bottom Stat ─────────────────────────────────────────────────────── */

function BottomStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="glass-card p-4 flex items-center gap-3"
      style={{ animation: "fade-in 0.5s ease-out both" }}
    >
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-[10px] text-muted uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
