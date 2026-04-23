"use client";

import { cn } from "@/lib/cn";
import type { Workspace } from "@/lib/types";

export function computeDna(ws: Workspace) {
  let score = 0;
  const checks: { label: string; ok: boolean; weight: number }[] = [
    { label: "Misyon", ok: !!ws.mission?.trim(), weight: 20 },
    { label: "Vizyon", ok: !!ws.vision?.trim(), weight: 20 },
    { label: "Stratejik Temalar", ok: ws.strategicThemes.length >= 2, weight: 25 },
    { label: "Değer Çıpaları", ok: ws.valueAnchors.length >= 1, weight: 15 },
    { label: "Yeterli tema çeşitliliği", ok: ws.strategicThemes.length >= 3, weight: 20 },
  ];
  checks.forEach((c) => {
    if (c.ok) score += c.weight;
  });
  return { score, checks };
}

export function DnaGauge({ ws }: { ws: Workspace }) {
  const { score, checks } = computeDna(ws);
  const radius = 48;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - score / 100);

  const ring =
    score >= 85
      ? "stroke-quantum"
      : score >= 60
      ? "stroke-ion"
      : score >= 40
      ? "stroke-solar"
      : "stroke-crimson";

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} className="fill-none stroke-elevated" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={cn("fill-none transition-all duration-700", ring)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-2xl font-semibold tabular-nums text-text">
            %{score}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-text-faint">DNA</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                c.ok ? "bg-quantum/20 text-quantum" : "bg-elevated text-text-faint"
              )}
            >
              {c.ok ? "✓" : "·"}
            </span>
            <span className={c.ok ? "text-text-muted" : "text-text-faint"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
