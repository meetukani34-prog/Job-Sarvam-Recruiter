"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ShieldAlert, AlertTriangle, Bug, Terminal, RefreshCw, Download, AlertCircle } from "lucide-react";

export default function TrapLogsPage() {
  const [metrics, setMetrics] = useState<{
    total_evaluated: number;
    stuffers_flagged: number;
    honeypots_purged: number;
    execution_time_ms: number;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sarvam_metrics');
    if (saved) {
      try {
        setMetrics(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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
                <h1 className="text-2xl font-bold tracking-tight text-red-500 flex items-center gap-2">
                  <ShieldAlert size={24} />
                  Security & Integrity Logs
                </h1>
                <p className="text-muted text-sm mt-1">Audit trail of synthetic honeypots purged and keyword stuffers flagged.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-subtle rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Download size={16} />
                  Export Logs
                </button>
              </div>
            </div>

            {metrics ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-8 bg-surface/30 border border-border-subtle rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                    <AlertTriangle size={32} className="text-amber-500" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">{metrics.stuffers_flagged.toLocaleString()}</div>
                  <div className="text-sm font-semibold text-muted uppercase tracking-wider">Keyword Stuffers Flagged</div>
                  <p className="text-xs text-muted mt-4 max-w-xs">
                    Non-technical candidates injecting target AI skills were identified and assigned a score of 0.0.
                  </p>
                </div>
                
                <div className="p-8 bg-surface/30 border border-border-subtle rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <Bug size={32} className="text-red-500" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">{metrics.honeypots_purged.toLocaleString()}</div>
                  <div className="text-sm font-semibold text-muted uppercase tracking-wider">Honeypots Purged</div>
                  <p className="text-xs text-muted mt-4 max-w-xs">
                    Mathematically impossible anomalous profiles were completely removed from the ranking stream.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-subtle rounded-2xl bg-surface/30">
                <AlertCircle size={32} className="text-muted mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Engine Data</h2>
                <p className="text-muted text-sm max-w-md">
                  Please upload a candidate JSON file on the main dashboard to generate authentic Trap Logs.
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
