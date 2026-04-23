"use client";

import type { Node } from "@xyflow/react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { StatusDot } from "../ui/StatusDot";
import type { Agent, Department, Skill, Workflow } from "@/lib/types";
import { ArrowUpRight, FileCode, Pencil, Trash2, X } from "lucide-react";
import { toast } from "@/lib/toast";

type NodeType = "department" | "agent" | "skill" | "workflow";

export function Inspector({
  node,
  onClose,
}: {
  node: Node | null;
  onClose: () => void;
}) {
  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-border/60 bg-surface/50">
      {!node ? (
        <EmptyInspector />
      ) : (
        <>
          <InspectorHeader node={node} onClose={onClose} />
          <div className="flex-1 overflow-y-auto">
            <InspectorBody node={node} />
          </div>
          <InspectorFooter node={node} />
        </>
      )}
    </aside>
  );
}

function EmptyInspector() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-elevated/50 text-text-muted">
        <Pencil size={18} strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-sm font-medium text-text">Bir düğüm seç</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
        Canvas'taki bir departmana, ajana, skill'e veya workflow'a tıkladığında buraya detay ve
        düzenleme paneli gelir.
      </p>
    </div>
  );
}

function InspectorHeader({ node, onClose }: { node: Node; onClose: () => void }) {
  const type = node.type as NodeType;
  const typeLabel: Record<NodeType, string> = {
    department: "Departman",
    agent: "Ajan",
    skill: "Skill",
    workflow: "Workflow",
  };
  const typeTone: Record<NodeType, "ion" | "nebula" | "quantum" | "solar"> = {
    department: "ion",
    agent: "ion",
    skill: "nebula",
    workflow: "quantum",
  };

  let title = "";
  if (type === "department") title = (node.data as { department: Department }).department.name;
  else if (type === "agent") title = (node.data as { agent: Agent }).agent.displayName;
  else if (type === "skill") title = (node.data as { skill: Skill }).skill.displayName;
  else if (type === "workflow") title = (node.data as { workflow: Workflow }).workflow.name;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge tone={typeTone[type]}>{typeLabel[type]}</Badge>
        </div>
        <h3 className="mt-2 text-base font-semibold tracking-tight text-text truncate">
          {title}
        </h3>
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-elevated hover:text-text"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">{label}</div>
      <div className={`mt-1 text-sm text-text ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function InspectorBody({ node }: { node: Node }) {
  const type = node.type as NodeType;

  if (type === "department") {
    const dept = (node.data as { department: Department }).department;
    return (
      <div className="space-y-5 p-5">
        <Field label="Açıklama" value={dept.description} />
        <Field label="Sahip" value={dept.owner} />
        <Field label="Sağlık" value={`%${dept.health}`} mono />
      </div>
    );
  }

  if (type === "agent") {
    const agent = (node.data as { agent: Agent }).agent;
    return (
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-2">
          <StatusDot tone={agent.status} />
          <span className="text-sm text-text capitalize">{agent.status}</span>
        </div>
        <Field label="Açıklama" value={agent.description} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Model" value={agent.model} mono />
          <Field label="Başarı" value={`%${Math.round(agent.successRate * 100)}`} mono />
          <Field label="Çağrı (bugün)" value={agent.callsToday} mono />
          <Field label="Skill sayısı" value={agent.skillIds.length} mono />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Yetki Scope'ları</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {agent.scopes.map((s) => (
              <Badge
                key={s}
                tone={
                  s === "external-send" ? "crimson" : s === "write" ? "ion" : "neutral"
                }
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <AgentMdPreview agent={agent} />
      </div>
    );
  }

  if (type === "skill") {
    const skill = (node.data as { skill: Skill }).skill;
    return (
      <div className="space-y-5 p-5">
        <Field label="Açıklama" value={skill.description} />
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Tetikleyiciler</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skill.triggers.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border/60 bg-elevated/60 px-2 py-1 font-mono text-[11px] text-text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Haftalık çalışma" value={skill.runsThisWeek} mono />
          <Field
            label="Golden test"
            value={
              <span className={skill.goldenTestPassing ? "text-quantum" : "text-crimson"}>
                {skill.goldenTestPassing ? "geçiyor" : "kırık"}
              </span>
            }
          />
        </div>
      </div>
    );
  }

  if (type === "workflow") {
    const wf = (node.data as { workflow: Workflow }).workflow;
    return (
      <div className="space-y-5 p-5">
        <Field label="Çalışma zamanı" value={wf.cadence} />
        <Field label="Sıradaki çalıştırma" value={wf.nextRun} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Adım" value={wf.steps} mono />
          <Field label="Son durum" value={wf.lastStatus} />
        </div>
      </div>
    );
  }

  return null;
}

function InspectorFooter({ node }: { node: Node }) {
  const type = node.type as NodeType;
  return (
    <div className="flex items-center gap-2 border-t border-border/60 p-3">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-crimson hover:bg-crimson/10"
        onClick={() =>
          toast({
            tone: "crimson",
            title: "Node silinecek",
            description: "Bu node bu iteration'da soft-remove edilecek. Undo: Cmd+Z. Prod'da confirmation gerektirir.",
          })
        }
      >
        <Trash2 size={12} />
        Sil
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            const fileName = type === "agent" ? "AGENT.md" : type === "skill" ? "SKILL.md" : "workflow.yaml";
            toast({
              tone: "ion",
              title: `${fileName} snapshot alındı`,
              description: "Canonical dosya clipboard'a kopyalandı (mock).",
            });
          }}
        >
          <FileCode size={12} />
          {type === "agent" ? "AGENT.md" : type === "skill" ? "SKILL.md" : "YAML"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast({
              tone: "nebula",
              title: "Düzenleyici açılıyor",
              description: "The Archive'da (Library) tam inline editor ile açılacak.",
              action: { label: "Archive'a git", href: "/library" },
            })
          }
        >
          <Pencil size={12} />
          Düzenle
          <ArrowUpRight size={12} />
        </Button>
      </div>
    </div>
  );
}

function AgentMdPreview({ agent }: { agent: Agent }) {
  const md = [
    "---",
    `name: ${agent.name}`,
    `model: ${agent.model}`,
    `description: ${agent.description.slice(0, 80)}...`,
    `tools: Read, Bash, WebSearch, ...`,
    "---",
  ].join("\n");
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">
          AGENT.md frontmatter
        </div>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-border/60 bg-void/60 p-3 font-mono text-[11px] leading-relaxed text-text-muted">
        {md}
      </pre>
    </div>
  );
}
