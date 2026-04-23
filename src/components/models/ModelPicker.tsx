"use client";

/**
 * ModelPicker — a compact inline picker used inside Workflow Inspector
 * (Skill step). Lets you pin a specific LLM model to a skill invocation.
 *
 * Bridges The Source (full catalog) into the Loading Program (workflow canvas)
 * without forcing the user to leave the canvas.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  llmModels,
  taskGroupOf,
  taskLabel,
  type LLMModel,
  type TaskType,
} from "@/lib/llm-catalog";
import { connectors } from "@/lib/connectors";
import { Box, ChevronDown, Database, Search, X, Zap } from "lucide-react";

const quickTaskFilters: { label: string; task: TaskType }[] = [
  { label: "Text Gen", task: "text-generation" },
  { label: "Summarize", task: "summarization" },
  { label: "ASR", task: "automatic-speech-recognition" },
  { label: "Text→Image", task: "text-to-image" },
  { label: "Doc QA", task: "document-qa" },
  { label: "Classify", task: "text-classification" },
];

export function ModelPicker({
  value,
  onChange,
  className,
}: {
  value?: string; // model id
  onChange: (modelId: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? llmModels.find((m) => m.id === value) : null;
  const selectedHost = selected
    ? connectors.find((c) => c.id === selected.connectorId)
    : null;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
          selected
            ? "border-nebula/40 bg-nebula-soft/30 text-text hover:border-nebula/60"
            : "border-dashed border-border/60 bg-elevated/30 text-text-muted hover:border-border-strong"
        )}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <Box size={13} className="shrink-0 text-nebula" />
            <span className="truncate font-medium">{selected.name}</span>
            {selectedHost && (
              <span className="shrink-0 rounded border border-border/60 bg-elevated/50 px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                {selectedHost.shortCode}
              </span>
            )}
            {selected.parameters != null && selected.parameters > 0 && (
              <span className="shrink-0 font-mono text-[10px] text-text-faint">
                {selected.parameters}B
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Database size={13} className="text-text-faint" />
            Model seç · The Source'tan
          </span>
        )}
        <ChevronDown size={12} className="shrink-0 text-text-faint" />
      </button>

      {open && (
        <ModelPickerDialog
          initialModelId={value}
          onSelect={(id) => {
            onChange(id);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function ModelPickerDialog({
  initialModelId,
  onSelect,
  onClose,
}: {
  initialModelId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [task, setTask] = useState<TaskType | null>(null);
  const [engineOnly, setEngineOnly] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return llmModels.filter((m) => {
      if (q) {
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.vendor.toLowerCase().includes(q) &&
          !m.tagline.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (task && !(m.taskTypes || []).includes(task)) return false;
      if (engineOnly) {
        const hosts = m.hostedOn || [];
        if (
          !hosts.some((h) => {
            const c = connectors.find((x) => x.id === h);
            return c?.category === "engines";
          })
        ) {
          return false;
        }
      }
      return true;
    });
  }, [query, task, engineOnly]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
      />
      <div className="relative flex h-[min(640px,85vh)] w-[min(640px,96vw)] flex-col overflow-hidden rounded-xl border border-border/70 bg-surface/95 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border/60 p-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-nebula" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                Model seç · The Source
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-text-muted hover:bg-elevated hover:text-text"
            >
              <X size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 flex items-center gap-2 rounded-md border border-border/60 bg-elevated/50 px-3 py-2">
            <Search size={13} className="text-text-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Model adı, vendor veya tagline ara"
              className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
            />
          </div>

          {/* Quick filters */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              Task
            </span>
            {quickTaskFilters.map((qf) => (
              <button
                key={qf.task}
                onClick={() => setTask((t) => (t === qf.task ? null : qf.task))}
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-[10px]",
                  task === qf.task
                    ? "border-nebula/50 bg-nebula-soft text-nebula"
                    : "border-border/60 bg-elevated/40 text-text-muted hover:text-text"
                )}
              >
                {qf.label}
              </button>
            ))}
            <label className="ml-auto flex cursor-pointer items-center gap-1.5 font-mono text-[10px] text-text-muted hover:text-text">
              <input
                type="checkbox"
                checked={engineOnly}
                onChange={(e) => setEngineOnly(e.target.checked)}
                className="accent-ion"
              />
              <Zap size={10} className="text-ion" />
              engine'de serve edilebilir
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="flex h-full items-center justify-center p-10 text-center">
              <div>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-elevated text-text-faint">
                  <Database size={16} />
                </div>
                <p className="text-sm text-text-muted">
                  Bu kriterlere uyan model yok.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {results.map((m) => {
                const host = connectors.find((c) => c.id === m.connectorId);
                const engineCount = (m.hostedOn || []).filter((h) => {
                  const c = connectors.find((x) => x.id === h);
                  return c?.category === "engines";
                }).length;
                const isActive = m.id === initialModelId;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => onSelect(m.id)}
                      className={cn(
                        "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                        isActive
                          ? "bg-nebula-soft/30"
                          : "hover:bg-elevated/40"
                      )}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-nebula/30 bg-nebula-soft/60 text-nebula">
                        <Box size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-text">
                            {m.name}
                          </span>
                          {host && (
                            <span className="rounded border border-border/60 bg-elevated/50 px-1.5 py-0.5 font-mono text-[9px] text-text-muted">
                              {host.shortCode}
                            </span>
                          )}
                          {m.parameters != null && m.parameters > 0 && (
                            <span className="font-mono text-[10px] text-text-faint">
                              {m.parameters}B
                            </span>
                          )}
                          {engineCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded border border-ion/30 bg-ion-soft/40 px-1 py-px font-mono text-[9px] text-ion">
                              <Zap size={7} />
                              {engineCount}
                            </span>
                          )}
                          {m.outputCostPerMTok != null && (
                            <span className="ml-auto shrink-0 font-mono text-[10px] text-text-muted">
                              ${m.outputCostPerMTok}/M
                            </span>
                          )}
                          {m.outputCostPerMTok == null && (
                            <span className="ml-auto shrink-0 font-mono text-[10px] text-quantum">
                              free
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted line-clamp-1">
                          {m.tagline}
                        </p>
                        {m.taskTypes && m.taskTypes.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.taskTypes.slice(0, 3).map((t) => {
                              const g = taskGroupOf[t];
                              const cls =
                                g === "nlp"
                                  ? "text-quantum border-quantum/30 bg-quantum-soft/60"
                                  : g === "vision"
                                  ? "text-nebula border-nebula/30 bg-nebula-soft/60"
                                  : g === "audio"
                                  ? "text-solar border-solar/30 bg-solar-soft/60"
                                  : g === "multimodal"
                                  ? "text-ion border-ion/30 bg-ion-soft/60"
                                  : "text-text-muted border-border/60 bg-elevated/60";
                              return (
                                <span
                                  key={t}
                                  className={cn(
                                    "rounded border px-1.5 py-px font-mono text-[9px]",
                                    cls
                                  )}
                                >
                                  {taskLabel[t]}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border/50 px-4 py-2.5">
          <span className="font-mono text-[10px] text-text-faint">
            {results.length} / {llmModels.length} model
          </span>
          <Link
            href="/models"
            onClick={onClose}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-nebula hover:text-text"
          >
            <Database size={10} />
            Tam kütüphaneyi aç →
          </Link>
        </div>
      </div>
    </div>
  );
}
