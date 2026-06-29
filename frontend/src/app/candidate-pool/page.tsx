"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Users, Search, Filter, MoreHorizontal, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import type { RankedCandidate, FlexibleJob, FlexibleSkill } from "@/types/candidate";

export default function CandidatePoolPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [realCandidates, setRealCandidates] = useState<RankedCandidate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<RankedCandidate | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncMessage("Connecting to ATS...");
    setTimeout(() => {
      setSyncMessage("Syncing profiles...");
      setTimeout(() => {
        setIsSyncing(false);
        setSyncMessage("");
      }, 1500);
    }, 1000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sarvam_rankings');
    if (saved) {
      try {
        setRealCandidates(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const filteredCandidates = realCandidates.filter(c => 
    c.candidate_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.reasoning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Offer Extended":
      case "Offer Accepted":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-glow/10 text-emerald-glow text-[11px] font-medium border border-emerald-glow/20"><CheckCircle2 size={12} /> {status}</span>;
      case "Interviewing":
      case "Screening":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-medium border border-blue-500/20"><Clock size={12} /> {status}</span>;
      case "Archived":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[11px] font-medium border border-slate-500/20"><XCircle size={12} /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-hover text-muted text-[11px] font-medium border border-border-subtle">{status}</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Candidate Pool</h1>
                <p className="text-muted text-sm mt-1">Manage and track your sourced candidates across all integrated pipelines.</p>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-glow hover:bg-emerald-bright disabled:opacity-70 disabled:hover:bg-emerald-glow text-[#0d0d11] rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Users size={16} />}
                {isSyncing ? syncMessage : "Sync ATS Data"}
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-surface/40 border border-border-subtle rounded-xl">
              <div className="relative w-full max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search by name, role, or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-glow/50 transition-colors"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 hover:bg-surface-hover border border-border-subtle rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${showFilters ? 'bg-surface-hover text-foreground' : 'bg-surface text-muted'}`}
                >
                  <Filter size={16} />
                  Filters
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 top-12 w-64 bg-surface border border-border-subtle rounded-lg shadow-xl z-20 p-4">
                    <h3 className="text-sm font-semibold mb-3">Filter Candidates</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted block mb-1.5">Minimum Score</label>
                        <input type="range" min="0" max="100" className="w-full accent-emerald-glow" />
                      </div>
                      <div>
                        <label className="text-xs text-muted block mb-1.5">Status</label>
                        <select className="w-full bg-background border border-border-subtle rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-emerald-glow/50 text-foreground">
                          <option>All Statuses</option>
                          <option>Ranked</option>
                          <option>Interviewing</option>
                          <option>Offer Extended</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="w-full py-2 bg-emerald-glow/10 text-emerald-glow hover:bg-emerald-glow/20 rounded-md text-sm font-medium transition-colors mt-2"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Table */}
            <div className="border border-border-subtle rounded-xl bg-surface/20 backdrop-blur-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface/50 border-b border-border-subtle text-muted text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Candidate</th>
                    <th className="px-6 py-4 font-medium">Experience</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Source</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredCandidates.map((cand) => (
                    <tr key={cand.candidate_id} className={`transition-colors group ${activeDropdown === cand.candidate_id ? 'relative z-50 bg-surface/40' : 'hover:bg-surface/40 relative z-0'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-600/50">
                            {cand.candidate_id.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{cand.candidate_id}</div>
                            <div className="text-[11px] text-muted max-w-xs truncate" title={cand.reasoning}>{cand.reasoning}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-glow font-mono">
                        {cand.score.toFixed(1)} / 100
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-glow/10 text-emerald-glow text-[11px] font-medium border border-emerald-glow/20">
                          Rank #{cand.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">
                        System Sync
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === cand.candidate_id ? null : cand.candidate_id);
                          }}
                          className={`p-1.5 rounded-md transition-colors ${activeDropdown === cand.candidate_id ? 'bg-surface text-foreground opacity-100' : 'text-muted hover:text-foreground hover:bg-surface opacity-0 group-hover:opacity-100'}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {activeDropdown === cand.candidate_id && (
                          <div 
                            ref={dropdownRef}
                            className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a24] border border-[#2d2d3d] rounded-lg shadow-2xl z-[9998] py-1 text-sm flex flex-col"
                          >
                            <button className="w-full text-left px-4 py-2 hover:bg-white/5 text-white transition-colors" onClick={() => { setActiveDropdown(null); setSelectedCandidate(cand); }}>View Full Profile</button>
                            <button className="w-full text-left px-4 py-2 hover:bg-white/5 text-white transition-colors" onClick={() => { setActiveDropdown(null); alert("Opening calendar scheduling for " + cand.candidate_id); }}>Schedule Interview</button>
                            <button className="w-full text-left px-4 py-2 hover:bg-white/5 text-white transition-colors" onClick={() => { setActiveDropdown(null); alert("Drafting email to " + cand.candidate_id); }}>Send Email</button>
                            <div className="h-px bg-[#2d2d3d] my-1"></div>
                            <button className="w-full text-left px-4 py-2 hover:bg-white/5 text-red-400 hover:text-red-300 transition-colors" onClick={() => { setActiveDropdown(null); alert("Archived " + cand.candidate_id); }}>Archive Candidate</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {realCandidates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted">
                        <AlertCircle size={32} className="mx-auto mb-4 text-muted" />
                        No real data uploaded. Run the engine on the main dashboard first.
                      </td>
                    </tr>
                  )}
                  {realCandidates.length > 0 && filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted">
                        No candidates found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </main>

      {/* Full Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0d0d11]/80 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)} />
          <div className="relative bg-[#15151e] border border-[#2d2d3d] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#2d2d3d] flex items-center justify-between sticky top-0 bg-[#15151e]/95 backdrop-blur-md z-10">
              <h2 className="text-xl font-semibold text-white">Candidate Profile</h2>
              <button onClick={() => setSelectedCandidate(null)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-auto">

              {/* ── Personal Info ── */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-xl font-bold text-white border border-emerald-500/30">
                  {(selectedCandidate.candidate_data?.profile?.name || selectedCandidate.candidate_data?.name || selectedCandidate.candidate_id).substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{selectedCandidate.candidate_data?.profile?.name || selectedCandidate.candidate_data?.name || selectedCandidate.candidate_id}</h3>
                  <p className="text-gray-400 text-sm">{selectedCandidate.candidate_data?.profile?.current_title || selectedCandidate.candidate_data?.current_title || "N/A"}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                    {(selectedCandidate.candidate_data?.profile?.location || selectedCandidate.candidate_data?.location) && <span>📍 {selectedCandidate.candidate_data?.profile?.location || selectedCandidate.candidate_data?.location}</span>}
                    <span>💼 {selectedCandidate.candidate_data?.profile?.years_of_experience || selectedCandidate.candidate_data?.total_experience_years || "N/A"} YOE</span>
                    {(selectedCandidate.candidate_data?.profile?.current_company) && <span>🏢 {selectedCandidate.candidate_data.profile.current_company}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{selectedCandidate.score.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">/ 100 • Rank #{selectedCandidate.rank}</div>
                </div>
              </div>

              {/* ── AI Reasoning ── */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">AI Reasoning</h4>
                <div className="bg-[#1a1a24] rounded-lg p-4 border border-[#2d2d3d]">
                  <p className="text-sm leading-relaxed text-gray-200">{selectedCandidate.reasoning}</p>
                </div>
              </div>

              {/* ── Score Breakdown ── */}
              {selectedCandidate.core_breakdown && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Score Breakdown</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-blue-400">{selectedCandidate.core_breakdown.experience?.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Experience</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-purple-400">{selectedCandidate.core_breakdown.technical_depth?.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Technical Depth</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-amber-400">{selectedCandidate.core_breakdown.education?.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Education</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-cyan-400">
                        {((selectedCandidate.core_breakdown.experience || 0) + 
                          (selectedCandidate.core_breakdown.technical_depth || 0) + 
                          (selectedCandidate.core_breakdown.education || 0)).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Raw Core</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-red-400">{selectedCandidate.core_breakdown.mass_service_penalty?.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Mass Svc Penalty</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-emerald-400">
                        {(((selectedCandidate.core_breakdown.experience || 0) + 
                           (selectedCandidate.core_breakdown.technical_depth || 0) + 
                           (selectedCandidate.core_breakdown.education || 0)) * 
                          (selectedCandidate.core_breakdown.mass_service_penalty || 1)).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Penalized Core</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-orange-400">{selectedCandidate.behavioral?.modifier?.toFixed(2) ?? "1.00"}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Behavioral Mod</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] text-center">
                      <div className="text-lg font-bold text-white">{selectedCandidate.score?.toFixed(1)}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Final Score</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500 text-right">
                    <span className="font-mono bg-gray-800 px-1 py-0.5 rounded text-gray-400">Score = (Penalized Core / 2.50) × 100 × Behavioral Mod</span>
                  </div>
                </div>
              )}

              {/* ── Behavioral Signals (All 23) ── */}
              {selectedCandidate.candidate_data?.redrob_signals && (() => {
                const s = selectedCandidate.candidate_data.redrob_signals;
                const pct = (v: unknown) => typeof v === 'number' ? `${(v > 1 ? v : v * 100).toFixed(0)}%` : "N/A";
                const bool = (v: unknown) => v === true ? <span className="text-emerald-400">✓ Yes</span> : v === false ? <span className="text-gray-500">✗ No</span> : <span className="text-gray-500">N/A</span>;
                const num = (v: unknown) => typeof v === 'number' ? (v === -1 ? "N/A" : String(v)) : "N/A";
                const str = (v: unknown) => typeof v === 'string' && v ? v : "N/A";

                const groups = [
                  { title: "📊 Engagement & Activity", items: [
                    { label: "Profile Completeness", value: pct(s.profile_completeness_score) },
                    { label: "Signup Date", value: str(s.signup_date) },
                    { label: "Last Active", value: str(s.last_active_date) },
                    { label: "Open to Work", value: bool(s.open_to_work_flag) },
                    { label: "Profile Views (30d)", value: num(s.profile_views_received_30d) },
                    { label: "Applications (30d)", value: num(s.applications_submitted_30d) },
                  ]},
                  { title: "💬 Recruiter Interaction", items: [
                    { label: "Response Rate", value: pct(s.recruiter_response_rate) },
                    { label: "Avg Response Time", value: typeof s.avg_response_time_hours === 'number' ? `${s.avg_response_time_hours.toFixed(1)}h` : "N/A" },
                    { label: "Search Appearances (30d)", value: num(s.search_appearance_30d) },
                    { label: "Saved by Recruiters (30d)", value: num(s.saved_by_recruiters_30d) },
                  ]},
                  { title: "🎯 Track Record", items: [
                    { label: "Interview Completion", value: typeof s.interview_completion_rate === 'number' ? (s.interview_completion_rate === -1 ? "No Data" : pct(s.interview_completion_rate)) : "N/A" },
                    { label: "Offer Acceptance", value: typeof s.offer_acceptance_rate === 'number' ? (s.offer_acceptance_rate === -1 ? "No Prior Offers" : pct(s.offer_acceptance_rate)) : "N/A" },
                  ]},
                  { title: "📋 Availability", items: [
                    { label: "Notice Period", value: typeof s.notice_period_days === 'number' ? `${s.notice_period_days} days` : "N/A" },
                    { label: "Current Salary", value: (() => {
                      const sal = s.current_salary_lpa ?? s.current_salary ?? selectedCandidate.candidate_data.current_salary ?? selectedCandidate.candidate_data.profile?.current_salary;
                      return typeof sal === 'number' ? `₹${sal.toFixed(1)}L` : (sal ? `₹${sal}` : "N/A");
                    })() },
                    { label: "Expected Salary", value: (() => {
                      if (s.expected_salary_range_inr_lpa) return `₹${s.expected_salary_range_inr_lpa.min ?? '?'}L – ₹${s.expected_salary_range_inr_lpa.max ?? '?'}L`;
                      const exp = s.expected_salary_lpa ?? s.expected_salary ?? selectedCandidate.candidate_data.expected_salary ?? selectedCandidate.candidate_data.profile?.expected_salary;
                      return typeof exp === 'number' ? `₹${exp.toFixed(1)}L` : (exp ? `₹${exp}` : "N/A");
                    })() },
                    { label: "Work Mode", value: str(s.preferred_work_mode) },
                    { label: "Willing to Relocate", value: bool(s.willing_to_relocate) },
                  ]},
                  { title: "🔗 Network & Skills", items: [
                    { label: "Connections", value: num(s.connection_count) },
                    { label: "Endorsements", value: num(s.endorsements_received) },
                    { label: "GitHub Score", value: typeof s.github_activity_score === 'number' ? (s.github_activity_score === -1 ? "No GitHub" : `${s.github_activity_score}/100`) : "N/A" },
                  ]},
                  { title: "✅ Verification", items: [
                    { label: "Email Verified", value: bool(s.verified_email) },
                    { label: "Phone Verified", value: bool(s.verified_phone) },
                    { label: "LinkedIn Connected", value: bool(s.linkedin_connected) },
                  ]},
                ];

                return (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Redrob Behavioral Signals ({Object.keys(s).length})</h4>
                    <div className="space-y-4">
                      {groups.map((group, gi) => (
                        <div key={gi}>
                          <div className="text-[11px] font-semibold text-gray-300 mb-2">{group.title}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {group.items.map((item, ii) => (
                              <div key={ii} className="bg-[#1a1a24] rounded-lg px-3 py-2 border border-[#2d2d3d]">
                                <div className="text-[10px] text-gray-500 mb-0.5">{item.label}</div>
                                <div className="text-xs font-medium text-gray-200">{item.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {/* Skill Assessment Scores */}
                      {s.skill_assessment_scores && Object.keys(s.skill_assessment_scores).length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-gray-300 mb-2">📝 Skill Assessments</div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(s.skill_assessment_scores).map(([skill, score], si) => (
                              <div key={si} className="bg-[#1a1a24] rounded-lg px-3 py-2 border border-[#2d2d3d] flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 capitalize">{skill.replace(/_/g, ' ')}</span>
                                <span className={`text-xs font-bold ${(score as number) >= 70 ? 'text-emerald-400' : (score as number) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{String(score)}/100</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── Skills ── */}
              {selectedCandidate.candidate_data?.skills && selectedCandidate.candidate_data.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Skills ({selectedCandidate.candidate_data.skills.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.candidate_data.skills.map((skill: FlexibleSkill, i: number) => {
                      const profLevel = (skill.proficiency || skill.proficiency_level || "beginner").toLowerCase();
                      const skillName = skill.name || skill.skill_name || "Unknown Skill";
                      const durationYears = skill.duration_months ? Math.round(skill.duration_months / 12) : 0;
                      const colors: Record<string, string> = {
                        expert: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                        advanced: "bg-blue-500/15 text-blue-400 border-blue-500/30",
                        intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                        beginner: "bg-gray-500/15 text-gray-400 border-gray-500/30",
                      };
                      return (
                        <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${colors[profLevel] || colors.beginner}`}>
                          {skillName}
                          <span className="opacity-60">• {profLevel} • {durationYears}y</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Career History ── */}
              {selectedCandidate.candidate_data?.career_history && selectedCandidate.candidate_data.career_history.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Career History</h4>
                  <div className="space-y-3">
                    {selectedCandidate.candidate_data.career_history.map((job: FlexibleJob, i: number) => {
                      const companyName = job.company || job.company_name || "N/A";
                      const jobTitle = job.title || job.job_title || "N/A";
                      return (
                        <div key={i} className="bg-[#1a1a24] rounded-lg p-4 border border-[#2d2d3d] flex items-start gap-3">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                            {companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-200">{jobTitle}</div>
                            <div className="text-xs text-gray-400">{companyName}</div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              {job.start_date || "?"} → {job.end_date || "Present"} • {job.duration_months ? `${Math.round(job.duration_months / 12)}y ${job.duration_months % 12}m` : "N/A"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Education ── */}
              {selectedCandidate.candidate_data?.education && selectedCandidate.candidate_data.education.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Education</h4>
                  <div className="space-y-3">
                    {selectedCandidate.candidate_data.education.map((edu, i) => {
                      const tierColors: Record<string, string> = {
                        tier_1: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                        tier_2: "bg-blue-500/15 text-blue-400 border-blue-500/30",
                        tier_3: "bg-gray-500/15 text-gray-400 border-gray-500/30",
                      };
                      return (
                        <div key={i} className="bg-[#1a1a24] rounded-lg p-4 border border-[#2d2d3d]">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm text-gray-200">{edu.degree || "N/A"}</div>
                              <div className="text-xs text-gray-400">{edu.university || edu.institution || edu.school || "N/A"}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {edu.tier && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${tierColors[edu.tier] || tierColors.tier_3}`}>
                                  {edu.tier.replace("_", " ").toUpperCase()}
                                </span>
                              )}
                              {edu.graduation_year && <span className="text-xs text-gray-500">{edu.graduation_year}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Redrob Signals (Summary) ── */}
              {selectedCandidate.candidate_data?.redrob_signals && (() => {
                const s = selectedCandidate.candidate_data.redrob_signals;
                const pct = (v: unknown) => typeof v === 'number' ? `${(v > 1 ? v : v * 100).toFixed(0)}%` : "N/A";
                return (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 mt-4 uppercase tracking-wider">Redrob Signals</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d]">
                      <div className="text-xs text-gray-500 mb-1">Recruiter Response Rate</div>
                      <div className="text-sm font-medium text-gray-200">{pct(s.recruiter_response_rate)}</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d]">
                      <div className="text-xs text-gray-500 mb-1">Profile Completeness</div>
                      <div className="text-sm font-medium text-gray-200">{pct(s.profile_completeness_score)}</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d]">
                      <div className="text-xs text-gray-500 mb-1">Notice Period</div>
                      <div className="text-sm font-medium text-gray-200">{s.notice_period_days} days</div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d]">
                      <div className="text-xs text-gray-500 mb-1">Open to Work</div>
                      <div className="text-sm font-medium">
                        {s.open_to_work_flag 
                          ? <span className="text-emerald-400">✓ Yes</span> 
                          : <span className="text-gray-500">✗ No</span>}
                      </div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d]">
                      <div className="text-xs text-gray-500 mb-1">Current Salary</div>
                      <div className="text-sm font-medium text-gray-200">
                        {(() => {
                          const sal = s.current_salary_lpa ?? s.current_salary ?? selectedCandidate.candidate_data.current_salary ?? selectedCandidate.candidate_data.profile?.current_salary;
                          return typeof sal === 'number' ? `₹${sal.toFixed(1)} LPA` : (sal ? `₹${sal} LPA` : "N/A");
                        })()}
                      </div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d]">
                      <div className="text-xs text-gray-500 mb-1">Expected Salary</div>
                      <div className="text-sm font-medium text-gray-200">
                        {(() => {
                          if (s.expected_salary_range_inr_lpa) return `₹${s.expected_salary_range_inr_lpa.min ?? '?'}L – ₹${s.expected_salary_range_inr_lpa.max ?? '?'} LPA`;
                          const exp = s.expected_salary_lpa ?? s.expected_salary ?? selectedCandidate.candidate_data.expected_salary ?? selectedCandidate.candidate_data.profile?.expected_salary;
                          return typeof exp === 'number' ? `₹${exp.toFixed(1)} LPA` : (exp ? `₹${exp} LPA` : "N/A");
                        })()}
                      </div>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2d2d3d] col-span-2">
                      <div className="text-xs text-gray-500 mb-1">Last Active</div>
                      <div className="text-sm font-medium text-gray-200">{s.last_active_date || "N/A"}</div>
                    </div>
                  </div>
                </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
