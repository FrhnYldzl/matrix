"use client";

import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { Check, ChevronsUpDown, Plus, Trophy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { estimateXp, progressToNextRank } from "@/lib/gamification";

const accentRing: Record<string, string> = {
  ion: "from-ion/80 to-ion/30",
  nebula: "from-nebula/80 to-nebula/30",
  quantum: "from-quantum/80 to-quantum/30",
  solar: "from-solar/80 to-solar/30",
};

export function WorkspaceSwitcher() {
  const {
    currentWorkspaceId,
    setWorkspace,
    workspaces,
    acceptedSuggestionSources,
    createdSkills,
    createdWorkflows,
  } = useWorkspaceStore();
  const current = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Gamification — XP + rank derived from portfolio state
  const rankProgress = useMemo(() => {
    const xp = estimateXp({
      workspaceCount: workspaces.length,
      acceptedSuggestions: acceptedSuggestionSources.length,
      createdSkills: createdSkills.length,
      createdWorkflows: createdWorkflows.length,
    });
    return progressToNextRank(xp);
  }, [workspaces.length, acceptedSuggestionSources.length, createdSkills.length, createdWorkflows.length]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex items-center gap-3 rounded-lg border border-border/70 bg-elevated/70 px-3 py-1.5 text-left transition-all duration-200 hover:border-border-strong hover:bg-raised"
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br font-mono text-[11px] font-semibold text-void",
            accentRing[current.accent]
          )}
        >
          {current.shortName}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-faint">Workspace</span>
          <span className="text-sm font-medium text-text">{current.name}</span>
        </span>
        <ChevronsUpDown size={14} className="ml-2 text-text-faint group-hover:text-text-muted" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-border/80 bg-surface/95 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint">
              Dijital İşlerin
            </div>
            <div className="mt-0.5 text-sm text-text-muted">
              Aktif workspace'i değiştir veya yeni bir tane ekle.
            </div>
          </div>

          {/* Rank pill */}
          <div className="border-b border-border/60 bg-elevated/30 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy
                  size={11}
                  className={cn(
                    rankProgress.current.tone === "crimson" && "text-crimson",
                    rankProgress.current.tone === "ion" && "text-ion",
                    rankProgress.current.tone === "quantum" && "text-quantum",
                    rankProgress.current.tone === "nebula" && "text-nebula",
                    rankProgress.current.tone === "solar" && "text-solar"
                  )}
                />
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.2em]",
                    rankProgress.current.tone === "crimson" && "text-crimson",
                    rankProgress.current.tone === "ion" && "text-ion",
                    rankProgress.current.tone === "quantum" && "text-quantum",
                    rankProgress.current.tone === "nebula" && "text-nebula",
                    rankProgress.current.tone === "solar" && "text-solar"
                  )}
                >
                  {rankProgress.current.label}
                </span>
              </div>
              {rankProgress.next && (
                <span className="font-mono text-[9px] text-text-faint">
                  {rankProgress.xpInCurrent} / {rankProgress.xpNeededForNext} XP
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
              {rankProgress.current.tagline}
            </p>
            {rankProgress.next && (
              <div className="mt-2">
                <div className="h-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className={cn(
                      "h-full transition-all",
                      rankProgress.current.tone === "crimson" && "bg-crimson",
                      rankProgress.current.tone === "ion" && "bg-ion",
                      rankProgress.current.tone === "quantum" && "bg-quantum",
                      rankProgress.current.tone === "nebula" && "bg-nebula",
                      rankProgress.current.tone === "solar" && "bg-solar"
                    )}
                    style={{ width: `${rankProgress.pct}%` }}
                  />
                </div>
                <div className="mt-1 font-mono text-[9px] text-text-faint">
                  sonraki: {rankProgress.next.label}
                </div>
              </div>
            )}
          </div>
          <ul className="py-1.5">
            {workspaces.map((w) => {
              const active = w.id === currentWorkspaceId;
              return (
                <li key={w.id}>
                  <button
                    onClick={() => {
                      setWorkspace(w.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      active ? "bg-elevated/70" : "hover:bg-elevated/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br font-mono text-[11px] font-semibold text-void",
                        accentRing[w.accent]
                      )}
                    >
                      {w.shortName}
                    </span>
                    <span className="flex-1 leading-tight">
                      <span className="block text-sm font-medium text-text">{w.name}</span>
                      <span className="block text-xs text-text-muted">{w.industry}</span>
                    </span>
                    {active && <Check size={14} className="text-ion" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border/60 p-2">
            <button
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-elevated/60 hover:text-text"
            >
              <Plus size={14} />
              Yeni şirket / proje ekle
            </button>
          </div>
        </div>
      )}

      <CreateWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
