"use client";

import { Search, Bell, Cpu, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-[60px] border-b border-border-subtle bg-[#0d0d11]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Scan by Candidate ID, Skill, or Intent..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-emerald-glow/30 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-emerald-glow/20 transition-all">
          <Cpu size={15} />
        </button>
        <button className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-emerald-glow/20 transition-all relative">
          <Bell size={15} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-glow rounded-full border-2 border-[#0d0d11]" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-border-subtle">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-foreground">SARVAM</p>
            <p className="text-[10px] text-muted"> Recruitment Platform</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-glow/20 to-emerald-dim/20 border border-emerald-glow/20 flex items-center justify-center">
            <User size={14} className="text-emerald-bright" />
          </div>
        </div>
      </div>
    </header>
  );
}
