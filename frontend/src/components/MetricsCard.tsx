"use client";

import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  suffix?: string;
  subtext: string;
  accentColor?: "emerald" | "amber" | "red";
  animationDelay?: number;
  isLoading?: boolean;
}

export default function MetricsCard({
  icon: Icon,
  title,
  value,
  suffix = "",
  subtext,
  accentColor = "emerald",
  animationDelay = 0,
  isLoading = false,
}: MetricsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  useEffect(() => {
    if (!isVisible || value === 0) return;

    const duration = 1200;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const counter = setInterval(() => {
      step++;
      // Ease-out cubic
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * value);

      setDisplayValue(current);

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(counter);
      }
    }, stepTime);

    return () => clearInterval(counter);
  }, [isVisible, value]);

  const accentMap = {
    emerald: {
      iconBg: "rgba(16, 185, 129, 0.1)",
      iconColor: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
    amber: {
      iconBg: "rgba(245, 158, 11, 0.1)",
      iconColor: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.15)",
    },
    red: {
      iconBg: "rgba(239, 68, 68, 0.1)",
      iconColor: "#ef4444",
      glowColor: "rgba(239, 68, 68, 0.15)",
    },
  };

  const colors = accentMap[accentColor];

  const formatNumber = (n: number): string => {
    if (n >= 1000) {
      return n.toLocaleString();
    }
    return n.toString();
  };

  return (
    <div
      ref={cardRef}
      className="metric-card p-6"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: colors.iconBg }}
        >
          <Icon size={18} style={{ color: colors.iconColor }} />
        </div>
        <span className="text-[13px] font-medium text-muted-foreground tracking-wide">
          {title}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="skeleton h-8 w-24 my-1 rounded" />
        ) : (
          <>
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatNumber(displayValue)}
            </span>
            {suffix && (
              <span
                className="text-sm font-medium"
                style={{ color: colors.iconColor }}
              >
                {suffix}
              </span>
            )}
          </>
        )}
      </div>

      {/* Subtext */}
      <p className="text-xs text-muted mt-2">{subtext}</p>
    </div>
  );
}
