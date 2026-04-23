"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Blueprint } from "@/lib/blueprints";
import { installBlueprint, type InstallProgress, type InstallResult } from "@/lib/blueprint-installer";
import { useWorkspaceStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { Check, Rocket, X } from "lucide-react";
import Link from "next/link";

export function InstallDrawer({
  open,
  blueprint,
  onClose,
}: {
  open: boolean;
  blueprint: Blueprint | null;
  onClose: () => void;
}) {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [phase, setPhase] = useState<"idle" | "installing" | "done">("idle");
  const [progress, setProgress] = useState<InstallProgress | null>(null);
  const [result, setResult] = useState<InstallResult | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const ran = useRef(false);

  useEffect(() => {
    if (!open) {
      // reset on close
      setPhase("idle");
      setProgress(null);
      setResult(null);
      setLog([]);
      ran.current = false;
    }
  }, [open]);

  const start = async () => {
    if (!blueprint || ran.current) return;
    ran.current = true;
    setPhase("installing");
    const store = useWorkspaceStore.getState();
    const r = await installBlueprint(
      blueprint,
      currentWorkspaceId,
      store,
      (p) => {
        setProgress(p);
        setLog((prev) =>
          [`[${p.step}] ${p.current}/${p.total} · ${p.label}`, ...prev].slice(0, 40)
        );
      },
      40
    );
    setResult(r);
    setPhase("done");
  };

  if (!open || !blueprint) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        aria-label="Kapat"
        onClick={phase === "installing" ? undefined : onClose}
        className="flex-1 bg-void/70 backdrop-blur-sm"
      />
      <aside className="flex h-full w-full max-w-2xl flex-col border-l border-border/70 bg-surface/95 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              Blueprint kurulumu
            </div>
            <h3 className="mt-1 text-lg font-semibold text-text">{blueprint.displayName}</h3>
          </div>
          {phase !== "installing" && (
            <button
              onClick={onClose}
              className="rounded-md p-2 text-text-muted hover:bg-elevated hover:text-text"
            >
              <X size={16} />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {phase === "idle" && (
            <IdlePhase blueprint={blueprint} onStart={start} />
          )}
          {phase === "installing" && (
            <InstallingPhase blueprint={blueprint} progress={progress} log={log} />
          )}
          {phase === "done" && result && (
            <DonePhase
              blueprint={blueprint}
              result={result}
              onClose={onClose}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function IdlePhase({
  blueprint,
  onStart,
}: {
  blueprint: Blueprint;
  onStart: () => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-text-muted">
        Bu blueprint'i kurduğunda Matrix şunları üretir ve aktif workspace'e düşürür:
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Spec n={blueprint.agents.length} l="Agent (AGENT.md)" />
        <Spec n={blueprint.skills.length} l="Skill (SKILL.md)" />
        <Spec n={blueprint.workflows.length} l="Workflow (.yaml)" />
        <Spec n={blueprint.okrs.length} l="OKR önerisi" />
      </div>

      <div className="rounded-lg border border-ion/30 bg-ion-soft/20 p-3">
        <div className="flex items-start gap-2 text-xs leading-relaxed text-text">
          <Rocket size={12} className="mt-0.5 shrink-0 text-ion" />
          <span>
            <b>Oracle Forge</b> her varlığı canonical şablonla üretir (frontmatter + başlıklar +
            hata senaryoları + değerlendirme kriteri). Kurulumdan sonra her birini Library ve
            Org Studio'dan ince ayarlayabilirsin.
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-solar/30 bg-solar-soft/20 p-3 text-xs leading-relaxed text-text-muted">
        <b className="text-solar">Dikkat:</b> external-send scope'u olan ajanlar (outreach, destek
        yanıtı vs.) hiçbir şey göndermez; tüm çıktılar Control Room'daki onay kuyruğuna düşer.
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="primary" size="md" className="gap-1.5" onClick={onStart}>
          <Rocket size={14} />
          Kurulumu başlat
        </Button>
      </div>
    </div>
  );
}

function InstallingPhase({
  blueprint,
  progress,
  log,
}: {
  blueprint: Blueprint;
  progress: InstallProgress | null;
  log: string[];
}) {
  const totalSteps =
    blueprint.agents.length + blueprint.skills.length + blueprint.workflows.length + blueprint.okrs.length;
  const done = log.filter(
    (l) =>
      l.startsWith("[agents]") ||
      l.startsWith("[skills]") ||
      l.startsWith("[workflows]") ||
      l.startsWith("[okrs]")
  ).length;
  const pct = totalSteps > 0 ? Math.min(100, (done / totalSteps) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Living canvas — animated constellation */}
      <div className="relative h-44 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-void via-surface/60 to-void">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 left-1/4 h-40 w-[300px] rounded-full bg-ion/15 blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 h-40 w-[300px] rounded-full bg-nebula/15 blur-3xl" />
        </div>
        <BirthingConstellation
          agents={blueprint.agents.length}
          skills={blueprint.skills.length}
          workflows={blueprint.workflows.length}
          done={done}
        />
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-void/80 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              <span
                className={cn(
                  "inline-flex h-1.5 w-1.5 rounded-full animate-breathe",
                  progress.step === "agents" && "bg-ion",
                  progress.step === "skills" && "bg-nebula",
                  progress.step === "workflows" && "bg-quantum",
                  progress.step === "okrs" && "bg-solar",
                  progress.step === "done" && "bg-quantum"
                )}
              />
              {progress.step === "agents"
                ? "Ajan doğuyor"
                : progress.step === "skills"
                ? "Skill formüle ediliyor"
                : progress.step === "workflows"
                ? "Workflow örülüyor"
                : progress.step === "okrs"
                ? "OKR yörüngelere yerleştiriliyor"
                : "Kurulum"}
            </div>
            <div className="mt-0.5 truncate text-sm text-text">{progress.label}</div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-text-faint">İlerleme</span>
          <span className="font-mono tabular-nums text-text">
            {done}/{totalSteps} · %{Math.round(pct)}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ion via-nebula to-quantum transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-void/60">
        <div className="border-b border-border/60 bg-elevated/50 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
          Forge motoru log
        </div>
        <pre className="max-h-[220px] overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed text-text-muted">
          {log.length === 0 ? "Hazırlanıyor…" : log.join("\n")}
        </pre>
      </div>
    </div>
  );
}

/** Tiny animated constellation — nodes light up as entities are born */
function BirthingConstellation({
  agents,
  skills,
  workflows,
  done,
}: {
  agents: number;
  skills: number;
  workflows: number;
  done: number;
}) {
  // Build a deterministic layout of N dots in 3 rows
  const rows = [
    { count: agents, color: "#4db8ff", label: "A", y: 28 }, // ion
    { count: skills, color: "#9b7bff", label: "S", y: 50 }, // nebula
    { count: workflows, color: "#3de0a8", label: "W", y: 72 }, // quantum
  ];
  let nodeIdx = 0;
  const nodes: { x: number; y: number; color: string; lit: boolean; label: string }[] = [];
  rows.forEach((row) => {
    for (let i = 0; i < row.count; i++) {
      const x = 8 + (i + 0.5) * (84 / Math.max(row.count, 1));
      const lit = nodeIdx < done;
      nodes.push({ x, y: row.y, color: row.color, lit, label: row.label });
      nodeIdx += 1;
    }
  });

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
      {/* Connecting gossamer */}
      {nodes.slice(0, -1).map((n, i) => {
        const next = nodes[i + 1];
        if (!n.lit || !next.lit) return null;
        return (
          <line
            key={`l-${i}`}
            x1={n.x}
            y1={n.y}
            x2={next.x}
            y2={next.y}
            stroke={n.color}
            strokeOpacity="0.35"
            strokeWidth="0.25"
          />
        );
      })}

      {nodes.map((n, i) => (
        <g key={`n-${i}`}>
          {n.lit && (
            <circle cx={n.x} cy={n.y} r="2.8" fill={n.color} opacity="0.25">
              <animate
                attributeName="r"
                from="1.5"
                to="4"
                dur="1.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.45"
                to="0"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          <circle
            cx={n.x}
            cy={n.y}
            r="1.1"
            fill={n.lit ? n.color : "#2a2e42"}
            opacity={n.lit ? 1 : 0.5}
          />
        </g>
      ))}
    </svg>
  );
}

function DonePhase({
  blueprint,
  result,
  onClose,
}: {
  blueprint: Blueprint;
  result: InstallResult;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg border border-quantum/40 bg-quantum-soft/30 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-quantum/20 text-quantum">
          <Check size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold text-text">Kurulum tamam!</div>
          <div className="mt-0.5 text-xs text-text-muted">
            {blueprint.displayName} blueprint'i {(result.durationMs / 1000).toFixed(1)} saniyede
            yüklendi.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Spec n={result.agentCount} l="Agent eklendi" tone="ion" />
        <Spec n={result.skillCount} l="Skill eklendi" tone="nebula" />
        <Spec n={result.workflowCount} l="Workflow eklendi" tone="quantum" />
        <Spec n={result.okrCount} l="OKR önerisi hazır" tone="solar" />
      </div>

      <p className="text-xs leading-relaxed text-text-muted">
        Her varlık <b className="text-text">Library</b>'de <span className="font-mono text-ion">catalog</span>{" "}
        rozetiyle görünür. <b className="text-text">Org Studio</b>'daki takımyıldız yeni ajanlarla
        doldu. <b className="text-text">Workflow Canvas</b>'ta yeni zincirleri editleyebilirsin.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link href="/library">
          <Button variant="secondary" size="md">Library'ye git</Button>
        </Link>
        <Link href="/org">
          <Button variant="secondary" size="md">Org Studio'ya git</Button>
        </Link>
        <Button variant="primary" size="md" onClick={onClose}>
          Kapat
        </Button>
      </div>
    </div>
  );
}

function Spec({
  n,
  l,
  tone = "neutral",
}: {
  n: number;
  l: string;
  tone?: "ion" | "nebula" | "quantum" | "solar" | "neutral";
}) {
  const toneCls =
    tone === "ion"
      ? "border-ion/30 bg-ion-soft text-ion"
      : tone === "nebula"
      ? "border-nebula/30 bg-nebula-soft text-nebula"
      : tone === "quantum"
      ? "border-quantum/30 bg-quantum-soft text-quantum"
      : tone === "solar"
      ? "border-solar/30 bg-solar-soft text-solar"
      : "border-border/60 bg-elevated/40 text-text-muted";
  return (
    <div className={cn("rounded-lg border px-3 py-2.5", toneCls)}>
      <div className="font-sans text-xl font-semibold tabular-nums">{n}</div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider opacity-80">{l}</div>
    </div>
  );
}
