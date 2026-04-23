"use client";

import { cn } from "@/lib/cn";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { Suggestion } from "@/lib/oracle";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  FileCode,
  Layers,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";

const kindMeta = {
  gap: { icon: Layers, tone: "ion" as const, label: "Organizasyon Boşluğu" },
  strategy: { icon: Compass, tone: "nebula" as const, label: "Stratejik Hiza" },
  ops: { icon: Wrench, tone: "quantum" as const, label: "Operasyonel" },
  risk: { icon: AlertTriangle, tone: "crimson" as const, label: "Risk" },
};

const prioMeta = {
  high: { tone: "crimson" as const, label: "Yüksek", dot: "bg-crimson" },
  medium: { tone: "solar" as const, label: "Orta", dot: "bg-solar" },
  low: { tone: "neutral" as const, label: "Düşük", dot: "bg-text-faint" },
};

export function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: Suggestion;
  onAccept?: (s: Suggestion) => void;
  onDismiss?: (s: Suggestion) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = kindMeta[suggestion.kind];
  const prio = prioMeta[suggestion.priority];
  const Icon = meta.icon;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:border-border-strong">
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            meta.tone === "ion" && "bg-ion-soft text-ion",
            meta.tone === "nebula" && "bg-nebula-soft text-nebula",
            meta.tone === "quantum" && "bg-quantum-soft text-quantum",
            meta.tone === "crimson" && "bg-crimson-soft text-crimson"
          )}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <Badge tone={prio.tone}>
              <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", prio.dot)} />
              {prio.label}
            </Badge>
            <span className="ml-auto font-mono text-[10px] text-text-faint">
              {suggestion.source}
            </span>
          </div>

          <h3 className="mt-2 text-[15px] font-medium leading-snug text-text">
            {suggestion.title}
          </h3>

          <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
            {suggestion.rationale}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border/50 bg-elevated/40 px-3 py-2 font-mono text-[11px] text-text-muted">
            <span className="text-text-faint">Öneri:</span>
            <span className="text-text">{suggestion.target}</span>
          </div>

          {suggestion.draft && expanded && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border/60 bg-void/60">
              <div className="flex items-center justify-between border-b border-border/60 bg-elevated/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileCode size={12} className="text-text-muted" />
                  <span className="font-mono text-[11px] text-text">
                    {suggestion.draft.filename}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                  {suggestion.draft.language}
                </span>
              </div>
              <pre className="max-h-80 overflow-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-text-muted">
                {suggestion.draft.content}
              </pre>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            {suggestion.draft ? (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} />
                    Taslağı gizle
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} />
                    Hazır taslağı gör
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-text-faint italic">Taslak bulunmuyor</span>
            )}

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-text-faint hover:text-text"
                onClick={() => onDismiss?.(suggestion)}
              >
                <X size={12} />
                Yoksay
              </Button>
              <Button size="sm" variant="secondary" className="h-7">
                İncele
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="h-7 gap-1"
                onClick={() => onAccept?.(suggestion)}
              >
                <Check size={12} />
                Kabul et
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function EmptyOracleState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-elevated/30 px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-quantum-soft text-quantum shadow-[0_0_40px_rgba(61,224,168,0.3)]">
        <Sparkles size={22} strokeWidth={1.4} />
      </div>
      <h3 className="mt-5 text-lg font-medium text-text">Her şey yolunda görünüyor</h3>
      <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
        Matrix bu workspace'i tam taradı ve şu an için bir boşluk, sapma veya risk tespit etmedi.
        Strateji evrildikçe veya yeni ajanlar eklendikçe öneriler burada görünecek.
      </p>
    </div>
  );
}
