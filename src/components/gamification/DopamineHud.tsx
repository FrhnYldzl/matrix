"use client";

/**
 * DopamineHud — TopBar'ın sağ orta kısmında sabit yaşayan mini-gösterge.
 *
 * 3 slot:
 *   1. 🔥 Streak   — ardışık gün sayısı (at-risk ise kırmızı titrer)
 *   2. ⚡ Today    — bugünkü XP miktarı
 *   3. 🎖️ Near     — sonraki rank'a kaç XP (critical'da parlar)
 *
 * Hover'da detaylı popover: günlük quest progress + weekly recap teaser.
 */

import { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import {
  computeStreak,
  nearMiss,
  questProgress,
  todaysQuests,
  xpToday,
  weeklyRecap,
} from "@/lib/dopamine";
import { Flame, Zap, Trophy, Target } from "lucide-react";

export function DopamineHud() {
  const events = useWorkspaceStore((s) => s.dopamineEvents);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const streak = useMemo(() => computeStreak(events), [events]);
  const today = useMemo(() => xpToday(events), [events]);
  const nm = useMemo(() => nearMiss(events), [events]);
  const quests = useMemo(() => todaysQuests(), []);
  const qp = useMemo(() => questProgress(quests, events), [quests, events]);
  const recap = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    const twoWeeksAgo = Date.now() - 14 * 86400000;
    const week = events.filter((e) => new Date(e.at).getTime() >= weekAgo);
    const prior = events.filter(
      (e) => new Date(e.at).getTime() >= twoWeeksAgo && new Date(e.at).getTime() < weekAgo
    );
    return weeklyRecap(week, prior);
  }, [events]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const questsDone = qp.filter((q) => q.done).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-all",
          streak.atRisk
            ? "border-crimson/50 bg-crimson-soft/30 animate-pulse"
            : "border-border/70 bg-elevated/40 hover:border-border-strong"
        )}
        title="Dopamine Engine — streak, XP, next rank"
      >
        {/* Streak */}
        <span
          className={cn(
            "flex items-center gap-1 font-mono",
            streak.currentDays >= 7 && "text-solar",
            streak.currentDays >= 3 && streak.currentDays < 7 && "text-nebula",
            streak.currentDays < 3 && "text-text-muted",
            streak.atRisk && "text-crimson"
          )}
        >
          <Flame size={12} className={cn(streak.currentDays >= 3 && "drop-shadow-[0_0_4px_currentColor]")} />
          <span className="tabular-nums">{streak.currentDays}</span>
        </span>

        <span className="h-3 w-px bg-border/60" />

        {/* Today XP */}
        <span className="flex items-center gap-1 font-mono text-ion">
          <Zap size={11} />
          <span className="tabular-nums">+{today}</span>
        </span>

        <span className="h-3 w-px bg-border/60" />

        {/* Near-miss */}
        <span
          className={cn(
            "flex items-center gap-1 font-mono",
            nm.critical ? "text-solar drop-shadow-[0_0_6px_currentColor]" : "text-text-muted"
          )}
        >
          <Trophy size={11} />
          <span className="tabular-nums">{nm.xpUntilNext > 0 ? nm.xpUntilNext : "∞"}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-border/80 bg-surface/95 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          {/* Header — rank + total XP */}
          <div
            className={cn(
              "border-b border-border/60 px-4 py-3",
              nm.current.tone === "crimson" && "bg-crimson-soft/20",
              nm.current.tone === "ion" && "bg-ion-soft/20",
              nm.current.tone === "nebula" && "bg-nebula-soft/20",
              nm.current.tone === "quantum" && "bg-quantum-soft/20",
              nm.current.tone === "solar" && "bg-solar-soft/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy
                  size={14}
                  className={cn(
                    nm.current.tone === "crimson" && "text-crimson",
                    nm.current.tone === "ion" && "text-ion",
                    nm.current.tone === "nebula" && "text-nebula",
                    nm.current.tone === "quantum" && "text-quantum",
                    nm.current.tone === "solar" && "text-solar"
                  )}
                />
                <span className="text-sm font-semibold text-text">{nm.current.label}</span>
              </div>
              <span className="font-mono text-xs text-text-muted tabular-nums">{nm.xp} XP</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{nm.current.tagline}</p>
            {nm.next && (
              <>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className={cn(
                      "h-full transition-all",
                      nm.critical ? "bg-solar" : "bg-nebula",
                      "shadow-[0_0_8px_currentColor]"
                    )}
                    style={{ width: `${nm.pct}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-text-faint">
                  <span>{nm.label}</span>
                  <span>{Math.round(nm.pct)}%</span>
                </div>
              </>
            )}
          </div>

          {/* Streak */}
          <div className="border-b border-border/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame
                  size={13}
                  className={cn(
                    streak.currentDays >= 7 && "text-solar drop-shadow-[0_0_6px_currentColor]",
                    streak.currentDays >= 3 && streak.currentDays < 7 && "text-nebula",
                    streak.currentDays < 3 && "text-text-muted"
                  )}
                />
                <span className="font-mono text-xs text-text">
                  {streak.currentDays} gün streak
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-faint">
                en uzun: {streak.longestDays}
              </span>
            </div>
            {streak.atRisk ? (
              <p className="mt-1 text-[11px] text-crimson">
                ⚠️ Streak tehlikede — bugün {Math.ceil(streak.hoursUntilLoss)}sa içinde 1 aksiyon
                gerekli
              </p>
            ) : streak.activeToday ? (
              <p className="mt-1 text-[11px] text-quantum">✓ Bugün işlendi — streak güvende</p>
            ) : (
              <p className="mt-1 text-[11px] text-text-muted">
                Bugün 1 aksiyon at → streak korunur
              </p>
            )}
          </div>

          {/* Daily quests */}
          <div className="border-b border-border/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={12} className="text-nebula" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  Günün görevleri
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-faint">
                {questsDone}/{qp.length}
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {qp.map((p) => (
                <li key={p.quest.id} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 inline-block text-base leading-none",
                      p.done ? "" : "grayscale opacity-50"
                    )}
                  >
                    {p.quest.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-[11px]",
                          p.done ? "text-quantum line-through" : "text-text"
                        )}
                      >
                        {p.quest.label}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[9px]",
                          p.done ? "text-quantum" : "text-text-faint"
                        )}
                      >
                        {p.done ? `+${p.quest.xpReward} XP ✓` : `${p.progress}/${p.quest.targetCount}`}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-snug text-text-muted">
                      {p.quest.description}
                    </p>
                    <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={cn(
                          "h-full transition-all",
                          p.done ? "bg-quantum" : "bg-nebula/60"
                        )}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Weekly recap */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-ion" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                Son 7 gün
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <Stat label="XP" value={`+${recap.totalXp}`} tone="ion" />
              <Stat label="aksiyon" value={recap.eventCount.toString()} tone="nebula" />
              <Stat label="streak" value={`${recap.streakDays}g`} tone="solar" />
            </div>
            {recap.rankDelta && (
              <p className="mt-2 font-mono text-[10px] text-quantum">
                ↑ {recap.rankDelta.from.label} → {recap.rankDelta.to.label}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ion" | "nebula" | "solar";
}) {
  return (
    <div className="rounded-md border border-border/50 bg-elevated/40 px-2 py-1.5">
      <div
        className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          tone === "ion" && "text-ion",
          tone === "nebula" && "text-nebula",
          tone === "solar" && "text-solar"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-text-faint">
        {label}
      </div>
    </div>
  );
}
