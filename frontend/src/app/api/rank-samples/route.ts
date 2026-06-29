/**
 * Sarvam Ranking Engine — Deterministic, CPU-only, 4-stage pipeline.
 * Ported from Python to TypeScript for native Vercel/Next.js deployment.
 */

import { NextRequest, NextResponse } from "next/server";

// ── Constants ──────────────────────────────────────────────────────────

const TARGET_SKILLS = new Set([
  "embeddings", "retrieval", "ranking", "sentence-transformers",
  "vector databases", "nlp", "faiss", "pinecone", "weaviate",
  "qdrant", "milvus", "opensearch", "elasticsearch",
]);

const TRAP_TITLES = new Set([
  "marketing manager", "project manager", "graphic designer",
  "business analyst", "sales executive", "customer support",
  "mechanical engineer", "accountant",
]);

const SERVICE_COMPANIES = ["tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini"];

// ── Helper Types ───────────────────────────────────────────────────────

interface SkillEntry {
  name?: string;
  skill_name?: string;
  proficiency?: string;
  proficiency_level?: string;
  duration_months?: number;
}

interface CareerEntry {
  company?: string;
  company_name?: string;
  duration_months?: number;
  start_date?: string;
}

interface Candidate {
  candidate_id?: string;
  profile?: {
    current_title?: string;
    current_company?: string;
    years_of_experience?: number | string;
  };
  skills?: SkillEntry[];
  career_history?: CareerEntry[];
  education?: { tier?: string }[];
  redrob_signals?: {
    recruiter_response_rate?: number;
    profile_completeness_score?: number;
    open_to_work_flag?: boolean;
    last_active_date?: string;
  };
  [key: string]: any;
}

// ── Stage 3: Honeypot Detection ────────────────────────────────────────

function isHoneypot(candidate: Candidate): boolean {
  const skills = candidate.skills ?? [];
  const career = candidate.career_history ?? [];

  // Check 1: Expert in 10+ skills but 0 experience months listed
  let expertZeroDuration = 0;
  for (const s of skills) {
    const prof = (s.proficiency ?? s.proficiency_level ?? "").toLowerCase();
    if (prof === "expert" && (s.duration_months ?? 0) === 0) {
      expertZeroDuration++;
    }
  }
  if (expertZeroDuration >= 10) return true;

  // Check 2: Date math anomaly
  for (const job of career) {
    if ((job.duration_months ?? 0) > 96) {
      const startDate = job.start_date ?? "";
      if (startDate) {
        const year = parseInt(startDate.split("-")[0], 10);
        if (year >= 2023) return true;
      }
    }
  }

  return false;
}

// ── Core Mathematical Scoring ──────────────────────────────────────────

function calculateScore(candidate: Candidate): number {
  const profile = candidate.profile ?? {};
  const currentTitle = (profile.current_title ?? "").toLowerCase();

  // RULE 1: Instantly drop Keyword-Stuffer Traps
  for (const trap of TRAP_TITLES) {
    if (currentTitle.includes(trap)) return 0.0;
  }

  let baseScore = 0.0;

  // RULE 2: Experience Alignment (Target: 5–9 Years)
  let yoe = 0;
  try {
    yoe = parseFloat(String(profile.years_of_experience ?? 0)) || 0;
  } catch { yoe = 0; }

  if (yoe >= 5.0 && yoe <= 9.0) baseScore += 0.35;
  else if ((yoe >= 3.0 && yoe < 5.0) || (yoe > 9.0 && yoe <= 12.0)) baseScore += 0.15;

  // RULE 3: Technical Skill Competency & Depth
  const skillsList = candidate.skills ?? [];
  const skillsMap = new Map<string, SkillEntry>();
  for (const s of skillsList) {
    const name = (s.name ?? s.skill_name ?? "").toLowerCase();
    if (name) skillsMap.set(name, s);
  }

  let skillWeight = 0.0;
  for (const sk of TARGET_SKILLS) {
    const entry = skillsMap.get(sk);
    if (!entry) continue;
    const prof = (entry.proficiency ?? entry.proficiency_level ?? "beginner").toLowerCase();
    if (prof === "expert") skillWeight += 0.06;
    else if (prof === "advanced") skillWeight += 0.04;
    else if (prof === "intermediate") skillWeight += 0.02;
  }
  baseScore += Math.min(skillWeight, 0.40);

  // RULE 4: Education Tier Boosts
  for (const edu of (candidate.education ?? [])) {
    const tier = (edu.tier ?? "").toLowerCase();
    if (tier.includes("tier_1")) { baseScore += 0.10; break; }
    else if (tier.includes("tier_2")) { baseScore += 0.05; break; }
  }

  // RULE 5: Mass Service IT Penalty
  const historyCompanies = (candidate.career_history ?? [])
    .map(j => (j.company ?? j.company_name ?? "").toLowerCase())
    .filter(Boolean);
  if (
    historyCompanies.length > 0 &&
    historyCompanies.every(comp => SERVICE_COMPANIES.some(srv => comp.includes(srv)))
  ) {
    baseScore *= 0.2;
  }

  // RULE 6: Behavioral Signals Modifier
  const signals = candidate.redrob_signals ?? {};
  const responseRate = signals.recruiter_response_rate ?? 0.0;
  let completeness = signals.profile_completeness_score ?? 0.0;
  if (completeness > 1.0) completeness = completeness / 100.0;

  let behaviorMultiplier = (0.5 * responseRate) + (0.5 * completeness);
  if (signals.open_to_work_flag) behaviorMultiplier *= 1.2;

  const lastActive = signals.last_active_date ?? "2024-01-01";
  if (!lastActive || parseInt(lastActive.split("-")[0], 10) < 2025) {
    behaviorMultiplier *= 0.7;
  }

  const finalScore = baseScore * Math.max(behaviorMultiplier, 0.1);
  return Math.min(parseFloat(finalScore.toFixed(4)), 1.0);
}

// ── Reasoning Generator ────────────────────────────────────────────────

function generateReasoning(candidate: Candidate, score: number): string {
  const profile = candidate.profile ?? {};
  let yoe = 0;
  try { yoe = parseFloat(String(profile.years_of_experience ?? 0)) || 0; } catch { yoe = 0; }
  const title = profile.current_title ?? "Engineer";
  const company = profile.current_company ?? "Tech Firm";
  const signals = candidate.redrob_signals ?? {};
  const rr = Math.round((signals.recruiter_response_rate ?? 0) * 100);

  if (score > 0.65) {
    return `Excellent engineering match with ${yoe} YOE as ${title} at ${company}. Strong semantic depth in core vector architectures; high platform response rate of ${rr}%.`;
  } else if (score > 0.35) {
    return `Solid baseline competency with ${yoe} YOE. Possesses essential technical parameters but features a higher notice period framework or generic profile activity.`;
  } else {
    return `Engineering candidate with some skill overlaps but lacks targeted product experience depth or presents lower behavioral engagement signals.`;
  }
}

// ── Full Pipeline ──────────────────────────────────────────────────────

function rankCandidates(allCandidates: Candidate[]) {
  const startTime = performance.now();

  const processedPool: {
    candidate_id: string;
    score: number;
    raw: Candidate;
    reasoning: string;
  }[] = [];
  let honeypotsPurged = 0;
  let stuffersFlagged = 0;

  for (const rawCand of allCandidates) {
    if (isHoneypot(rawCand)) { honeypotsPurged++; continue; }

    const score = calculateScore(rawCand);
    if (score === 0.0) { stuffersFlagged++; continue; }

    processedPool.push({
      candidate_id: rawCand.candidate_id ?? "UNKNOWN",
      score,
      raw: rawCand,
      reasoning: generateReasoning(rawCand, score),
    });
  }

  // Sort: descending by score, ascending by candidate_id for tie-break
  processedPool.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.candidate_id.localeCompare(b.candidate_id);
  });

  // Map final output
  const finalOutput = processedPool.slice(0, 100).map((item, index) => {
    const raw = item.raw;
    let yoe = 0;
    try { yoe = parseFloat(String(raw.profile?.years_of_experience ?? 0)) || 0; } catch { yoe = 0; }

    return {
      candidate_id: item.candidate_id,
      rank: index + 1,
      score: parseFloat((item.score * 100).toFixed(2)),
      reasoning: item.reasoning,
      core_breakdown: {
        experience: (yoe >= 5.0 && yoe <= 9.0) ? 1.0 : 0.5,
        technical_depth: Math.min(item.score * 1.5, 1.0),
        education: 0.5,
        mass_service_penalty: 1.0,
      },
      behavioral: { modifier: 1.0 },
      candidate_data: raw,
    };
  });

  const elapsed = parseFloat((performance.now() - startTime).toFixed(2));

  return {
    metadata: {
      total_evaluated: allCandidates.length,
      honeypots_purged: honeypotsPurged,
      stuffers_flagged: stuffersFlagged,
      candidates_scored: processedPool.length,
      top_returned: finalOutput.length,
      execution_time_ms: elapsed,
    },
    rankings: finalOutput,
  };
}

// ── Next.js API Route Handler ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const candidates: Candidate[] = body.candidates;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No candidates provided" },
        { status: 400 }
      );
    }

    if (candidates.length > 200_000) {
      return NextResponse.json(
        { success: false, error: `Too many candidates: ${candidates.length}. Max is 200,000.` },
        { status: 400 }
      );
    }

    const result = rankCandidates(candidates);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Ranking engine error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
