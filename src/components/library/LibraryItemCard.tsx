"use client";

import { cn } from "@/lib/cn";
import type { CreationOrigin } from "@/lib/store";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  FileCode,
  Code2 as Github,
  Globe,
  Pencil,
  Sparkles,
  Upload,
} from "lucide-react";
import type { ReactNode } from "react";

const originMeta: Record<
  CreationOrigin,
  { label: string; tone: "nebula" | "ion" | "solar" | "neutral"; icon: typeof Sparkles }
> = {
  oracle: { label: "Oracle", tone: "nebula", icon: Sparkles },
  catalog: { label: "Catalog", tone: "ion", icon: Globe },
  import: { label: "Import", tone: "solar", icon: Upload },
  manual: { label: "Manual", tone: "neutral", icon: Pencil },
};

export interface LibraryItemCardProps {
  kind: "skill" | "agent" | "workflow";
  name: string;
  displayName: string;
  summary: string;
  tags?: string[];
  origin: CreationOrigin | "seed";
  meta?: ReactNode; // right-side stat block
  footer?: ReactNode; // bottom-row extra info
  onOpen?: () => void;
  filePath?: string;
}

const kindTone = {
  skill: "nebula",
  agent: "ion",
  workflow: "quantum",
} as const;

const kindLabel = {
  skill: "Skill",
  agent: "Agent",
  workflow: "Workflow",
} as const;

export function LibraryItemCard(props: LibraryItemCardProps) {
  const { kind, name, displayName, summary, tags = [], origin, meta, footer, filePath } = props;
  const oMeta = origin === "seed" ? null : originMeta[origin];
  const OIcon = oMeta?.icon;

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-border-strong">
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-semibold uppercase",
            kindTone[kind] === "nebula" && "border-nebula/40 bg-nebula-soft text-nebula",
            kindTone[kind] === "ion" && "border-ion/40 bg-ion-soft text-ion",
            kindTone[kind] === "quantum" && "border-quantum/40 bg-quantum-soft text-quantum"
          )}
        >
          {displayName
            .split(/[\s-]+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={kindTone[kind]}>{kindLabel[kind]}</Badge>
            {oMeta && (
              <Badge tone={oMeta.tone}>
                {OIcon && <OIcon size={10} className="mr-1" />}
                {oMeta.label}
              </Badge>
            )}
            {origin === "seed" && (
              <span className="rounded-md border border-border/60 bg-elevated/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-faint">
                seed
              </span>
            )}
            <span className="ml-auto font-mono text-[10px] text-text-faint">{name}</span>
          </div>
          <h3 className="mt-2 text-[15px] font-medium leading-snug text-text">{displayName}</h3>
          <p className="mt-1 text-sm leading-relaxed text-text-muted line-clamp-2">{summary}</p>

          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 5).map((t) => (
                <span
                  key={t}
                  className="rounded border border-border/50 bg-elevated/50 px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {meta && (
          <div className="shrink-0 text-right font-mono text-[11px] text-text-muted">{meta}</div>
        )}
      </div>

      {(footer || filePath) && (
        <div className="flex items-center justify-between gap-3 border-t border-border/50 px-5 py-3">
          <div className="min-w-0 flex-1 truncate">
            {filePath && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-text-faint">
                <FileCode size={11} />
                {filePath}
              </span>
            )}
          </div>
          {footer}
        </div>
      )}
    </Card>
  );
}

// Optional: github-style action row when item is a catalog entry not yet installed
export function CatalogItemRow({
  kind,
  name,
  displayName,
  summary,
  tags,
  source,
  stars,
  installs,
  onInstall,
}: {
  kind: "skill" | "agent" | "workflow";
  name: string;
  displayName: string;
  summary: string;
  tags: string[];
  source: string;
  stars?: number;
  installs?: number;
  onInstall?: () => void;
}) {
  const SourceIcon = source === "github" ? Github : source === "n8n-mirror" ? Upload : Sparkles;

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/60 bg-elevated/30 p-3 transition-colors hover:border-border-strong hover:bg-elevated/60">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
          kind === "skill" && "border-nebula/40 bg-nebula-soft text-nebula",
          kind === "agent" && "border-ion/40 bg-ion-soft text-ion",
          kind === "workflow" && "border-quantum/40 bg-quantum-soft text-quantum"
        )}
      >
        <SourceIcon size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-text">{displayName}</span>
          <span className="font-mono text-[10px] text-text-faint">{name}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{summary}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-text-faint">
          <span className="font-mono">{source}</span>
          {stars != null && <span>· ★ {stars}</span>}
          {installs != null && <span>· {installs.toLocaleString("tr-TR")} kurulum</span>}
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded bg-elevated/60 px-1.5 py-0.5">
              {t}
            </span>
          ))}
        </div>
      </div>
      <Button size="sm" variant="primary" className="h-7 shrink-0" onClick={onInstall}>
        Envantere ekle
      </Button>
    </div>
  );
}
