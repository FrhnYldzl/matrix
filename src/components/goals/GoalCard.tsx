"use client";

import { cn } from "@/lib/cn";
import { agents, skills, workspaces } from "@/lib/mock-data";
import type { Goal } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/store";
import { Card } from "../ui/Card";
import { RadialProgress } from "../ui/RadialProgress";
import { Sparkline } from "../ui/Sparkline";
import { Bot, Pencil, Wrench, X } from "lucide-react";
import { useState } from "react";

const trajectoryMeta: Record<
  Goal["trajectory"],
  { label: string; tone: "quantum" | "ion" | "solar" | "crimson"; text: string }
> = {
  ahead: { label: "Önde", tone: "quantum", text: "text-quantum" },
  "on-track": { label: "Rotada", tone: "ion", text: "text-ion" },
  "at-risk": { label: "Risk", tone: "solar", text: "text-solar" },
  "off-track": { label: "Saptı", tone: "crimson", text: "text-crimson" },
};

function progressPct(g: Goal): number {
  // For invert metrics, "progress toward target" is measured by how much the current
  // has dropped from the worst historical value toward the target.
  if (g.invert) {
    const worst = g.history && g.history.length ? Math.max(...g.history) : g.current;
    if (worst <= g.target) return 100;
    const dropped = worst - g.current;
    const needed = worst - g.target;
    return Math.max(0, Math.min(100, (dropped / needed) * 100));
  }
  return Math.max(0, Math.min(100, (g.current / g.target) * 100));
}

export function GoalCard({ goal }: { goal: Goal }) {
  const meta = trajectoryMeta[goal.trajectory];
  const pct = progressPct(goal);
  const ws = workspaces.find((w) => w.id === goal.workspaceId);
  const updateGoalProgress = useWorkspaceStore((s) => s.updateGoalProgress);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);
  const isStoreOwned = createdGoals.some((c) => c.entity.id === goal.id);
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(goal.current.toString());

  const save = () => {
    const n = Number(draftValue);
    if (Number.isFinite(n) && n >= 0) {
      updateGoalProgress(goal.id, n);
    }
    setEditing(false);
  };
  const linkedAgents = goal.linkedAgentIds
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean);
  const linkedSkills = goal.linkedSkillIds
    .map((id) => skills.find((s) => s.id === id))
    .filter(Boolean);
  const linkedThemes =
    (goal.linkedThemeIds || [])
      .map((id) => ws?.strategicThemes.find((t) => t.id === id))
      .filter(Boolean) || [];

  return (
    <Card className="relative overflow-hidden">
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          meta.tone === "quantum" && "bg-quantum/70",
          meta.tone === "ion" && "bg-ion/70",
          meta.tone === "solar" && "bg-solar/70",
          meta.tone === "crimson" && "bg-crimson/70"
        )}
      />

      <div className="flex items-start gap-5 p-5">
        <RadialProgress value={pct} tone={meta.tone} size={96} stroke={9}>
          <div className="flex flex-col items-center leading-tight">
            <span className="font-sans text-xl font-semibold tabular-nums text-text">
              %{Math.round(pct)}
            </span>
            <span className={cn("mt-0.5 font-mono text-[9px] uppercase tracking-wider", meta.text)}>
              {meta.label}
            </span>
          </div>
        </RadialProgress>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              {goal.cadence === "weekly" ? "Haftalık" : goal.cadence === "monthly" ? "Aylık" : "Çeyreklik"}
              {goal.owner && ` · ${goal.owner}`}
            </span>
          </div>
          <h3 className="mt-1 text-[15px] font-medium text-text leading-snug">{goal.title}</h3>
          <div className="mt-1 font-mono text-[11px] text-text-muted">{goal.metric}</div>

          <div className="mt-3 flex items-baseline gap-3">
            {editing && isStoreOwned ? (
              <>
                <input
                  type="number"
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  autoFocus
                  className={cn(
                    "w-24 rounded-md border bg-elevated/60 px-2 py-1 text-2xl font-semibold tabular-nums outline-none",
                    "border-nebula/40 focus:border-nebula",
                    meta.text
                  )}
                />
                <button
                  onClick={save}
                  className="rounded-md bg-quantum-soft px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-quantum hover:bg-quantum/20"
                >
                  kaydet
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md p-1 text-text-faint hover:text-text"
                  aria-label="İptal"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => isStoreOwned && setEditing(true)}
                  disabled={!isStoreOwned}
                  className={cn(
                    "group inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors",
                    isStoreOwned && "hover:bg-elevated/50 cursor-text",
                    !isStoreOwned && "cursor-default"
                  )}
                  title={isStoreOwned ? "Mevcut değeri güncelle" : "Seed goal — read-only mock"}
                >
                  <span className={cn("text-2xl font-semibold tabular-nums", meta.text)}>
                    {goal.current}
                    {goal.unit === "%" && "%"}
                  </span>
                  {isStoreOwned && (
                    <Pencil
                      size={11}
                      className="text-text-faint opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  )}
                </button>
                <span className="text-xs text-text-faint">
                  /{" "}
                  <span className="font-mono">
                    {goal.target}
                    {goal.unit === "%" ? "%" : ` ${goal.unit}`}
                  </span>
                </span>
              </>
            )}
            {goal.invert && (
              <span className="ml-auto rounded-sm border border-border/50 bg-elevated/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-faint">
                düşük = iyi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {goal.history && goal.history.length > 0 && (
        <div className="px-5 pb-2">
          <Sparkline
            data={goal.history}
            target={goal.target}
            tone={meta.tone}
            width={500}
            height={64}
            invert={goal.invert}
            className="w-full"
          />
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-text-faint">
            <span>12 hafta önce</span>
            <span>şimdi</span>
          </div>
        </div>
      )}

      {/* Linked */}
      <div className="border-t border-border/50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {linkedThemes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                tema:
              </span>
              {linkedThemes.map((t) => (
                <span
                  key={t!.id}
                  className="rounded border border-nebula/30 bg-nebula-soft px-1.5 py-0.5 font-mono text-[10px] text-nebula"
                >
                  {t!.label}
                </span>
              ))}
            </div>
          )}
          {linkedAgents.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Bot size={11} className="text-text-muted" />
              {linkedAgents.map((a) => (
                <span
                  key={a!.id}
                  className="rounded border border-ion/30 bg-ion-soft px-1.5 py-0.5 font-mono text-[10px] text-ion"
                >
                  {a!.name}
                </span>
              ))}
            </div>
          )}
          {linkedSkills.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Wrench size={11} className="text-text-muted" />
              {linkedSkills.map((s) => (
                <span
                  key={s!.id}
                  className="rounded border border-quantum/30 bg-quantum-soft px-1.5 py-0.5 font-mono text-[10px] text-quantum"
                >
                  {s!.name}
                </span>
              ))}
            </div>
          )}
          {linkedAgents.length === 0 && linkedSkills.length === 0 && linkedThemes.length === 0 && (
            <span className="text-xs italic text-text-faint">
              Bu hedef hiçbir ajan/skill/temaya bağlı değil — Oracle sebebini soruyor.
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
