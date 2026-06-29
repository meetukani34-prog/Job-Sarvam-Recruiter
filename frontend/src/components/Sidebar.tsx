"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Settings,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Candidate Pool", href: "/candidate-pool" },
  { icon: ShieldAlert, label: "Trap Logs", href: "/trap-logs" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-[220px] min-h-screen flex flex-col border-r border-border-subtle bg-[#0d0d11] px-3 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-glow to-emerald-dim flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground tracking-tight">
            Sarvam
          </h1>
          <p className="text-[10px] text-muted font-medium tracking-wider uppercase">
            AI Recruiter
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-4 border-t border-border-subtle">
        <p className="text-[10px] text-muted">Redrob Hackathon v4</p>
        <p className="text-[10px] text-muted mt-0.5">Engine v1.0 · CPU</p>
      </div>
    </aside>
  );
}
