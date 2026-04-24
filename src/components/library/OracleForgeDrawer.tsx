"use client";

/**
 * OracleForgeDrawer — "Vibe coding" arayüzü.
 *
 * Kullanıcı doğal dille bir niyet yazıyor, Oracle Forge
 * canonical bir SKILL / AGENT / WORKFLOW yapısı üretiyor.
 *
 * The Archive'da prominent "🧪 Oracle Forge" butonuyla açılır.
 */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import {
  FORGE_EXAMPLES,
  forge,
  type ForgeKind,
  type ForgedAgent,
  type ForgedEntity,
  type ForgedSkill,
  type ForgedWorkflow,
} from "@/lib/oracle-forge";
import type { Agent, Skill, Workflow } from "@/lib/types";
import { Button } from "../ui/Button";
import {
  Bot,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wand2,
  Waypoints,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type Phase = "compose" | "analyzing" | "preview" | "accepted";

const KIND_META: Record<
  ForgeKind,
  { label: string; icon: typeof Wrench; tone: "nebula" | "ion" | "quantum"; hint: string }
> = {
  skill: {
    label: "Skill",
    icon: Wrench,
    tone: "nebula",
    hint: "Tekrarlayan bir fonksiyon — input alır, output üretir (örn. content-writer, keyword-researcher)",
  },
  agent: {
    label: "Agent",
    icon: Bot,
    tone: "ion",
    hint: "Birden çok skill'i orchestrate eden aktör — bir role sahip (örn. Customer Onboarder, SEO Researcher)",
  },
  workflow: {
    label: "Workflow",
    icon: Waypoints,
    tone: "quantum",
    hint: "Zamanlanmış veya tetiklenmiş çok-adımlı otomasyon zinciri",
  },
};

export function OracleForgeDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    currentWorkspaceId,
    workspaces,
    createSkill,
    createAgent,
    createWorkflow,
    createdSkills,
  } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId);

  const [phase, setPhase] = useState<Phase>("compose");
  const [kind, setKind] = useState<ForgeKind>("skill");
  const [intent, setIntent] = useState("");
  const [forged, setForged] = useState<ForgedEntity | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setPhase("compose");
      setIntent("");
      setForged(null);
    }
  }, [open]);

  const existingSkillNames = useMemo(
    () =>
      createdSkills
        .filter((c) => c.entity.workspaceId === currentWorkspaceId)
        .map((c) => c.entity.name),
    [createdSkills, currentWorkspaceId]
  );

  const startForge = () => {
    if (intent.trim().length < 10) return;
    setPhase("analyzing");
    setTimeout(() => {
      const result = forge({
        kind,
        intent,
        context: {
          workspaceName: ws?.name,
          niche: ws?.industry,
          existingSkills: existingSkillNames,
        },
      });
      setForged(result);
      setPhase("preview");
    }, 1400);
  };

  const accept = () => {
    if (!forged || !ws) return;

    if (forged.kind === "skill") {
      const skill: Skill = {
        id: `sk-${ws.id}-${forged.name}-${Math.random().toString(36).slice(2, 6)}`,
        workspaceId: ws.id,
        ownerAgentId: "",
        name: forged.name,
        displayName: forged.displayName,
        description: forged.summary,
        triggers: [],
        runsThisWeek: 0,
        goldenTestPassing: false,
      };
      createSkill(
        { entity: skill, origin: "oracle", createdAt: new Date().toISOString() },
        "oracle-forge"
      );
    } else if (forged.kind === "agent") {
      const agent: Agent = {
        id: `ag-${ws.id}-${forged.name}-${Math.random().toString(36).slice(2, 6)}`,
        workspaceId: ws.id,
        departmentId: "",
        name: forged.name,
        displayName: forged.displayName,
        description: forged.summary,
        model: forged.model,
        status: "idle",
        scopes: ["read"],
        skillIds: [],
        callsToday: 0,
        successRate: 0,
      };
      createAgent(
        { entity: agent, origin: "oracle", createdAt: new Date().toISOString() },
        "oracle-forge"
      );
    } else {
      const workflow: Workflow = {
        id: `wf-${ws.id}-${forged.name}-${Math.random().toString(36).slice(2, 6)}`,
        workspaceId: ws.id,
        departmentId: "",
        name: forged.name,
        cadence: forged.cadence,
        nextRun: "",
        lastStatus: "success",
        steps: forged.steps.length,
        description: forged.summary,
      };
      createWorkflow(
        { entity: workflow, origin: "oracle", createdAt: new Date().toISOString() },
        "oracle-forge"
      );
    }

    setPhase("accepted");
    toast({
      tone: "quantum",
      title: `${KIND_META[forged.kind].label} forge edildi · +${forged.kind === "workflow" ? 25 : 15} XP`,
      description: `"${forged.displayName}" The Archive'a düştü. ${forged.kind === "skill" ? "Bir agent'a bağlayarak kullan." : forged.kind === "agent" ? "Skill'lerini Archive'dan ata." : "The Loading Program'da canvas'ı görebilirsin."}`,
      action: { label: "Archive'a git", href: "/library" },
    });
    setTimeout(() => onClose(), 2500);
  };

  if (!open || !mounted) return null;
  if (!ws) return null;

  const meta = KIND_META[kind];
  const Icon = meta.icon;

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-void/85 backdrop-blur-sm cursor-pointer"
      />
      <div className="relative flex max-h-[92vh] w-[min(760px,96vw)] flex-col overflow-hidden rounded-2xl border border-nebula/30 bg-surface/95 shadow-[0_0_80px_rgba(155,123,255,0.15)] backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <header className="relative overflow-hidden border-b border-border/60 p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/80 to-transparent" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-nebula/50 bg-nebula-soft text-nebula shadow-[0_0_24px_rgba(155,123,255,0.3)]">
                <Wand2 size={18} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
                  Oracle Forge · vibe coding
                </div>
                <h2 className="mt-1 text-xl font-semibold text-text">
                  {phase === "compose" &&
                    "Ne istiyorsun? Oracle canonical yapıyı kuracak."}
                  {phase === "analyzing" && "Oracle forging…"}
                  {phase === "preview" &&
                    `${KIND_META[forged!.kind].label}: ${forged!.displayName}`}
                  {phase === "accepted" && "Forge tamamlandı."}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-text-muted hover:bg-elevated hover:text-text"
              aria-label="Kapat"
            >
              <X size={14} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {phase === "compose" && (
            <div className="space-y-5">
              {/* Kind selector */}
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Ne forge edilecek?
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(KIND_META) as ForgeKind[]).map((k) => {
                    const m = KIND_META[k];
                    const IconK = m.icon;
                    const active = k === kind;
                    return (
                      <button
                        key={k}
                        onClick={() => setKind(k)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors",
                          active
                            ? m.tone === "ion"
                              ? "border-ion/50 bg-ion-soft text-ion"
                              : m.tone === "quantum"
                              ? "border-quantum/50 bg-quantum-soft text-quantum"
                              : "border-nebula/50 bg-nebula-soft text-nebula"
                            : "border-border/60 bg-elevated/30 text-text-muted hover:border-border-strong hover:text-text"
                        )}
                      >
                        <IconK size={18} />
                        <span className="text-sm font-medium">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                  <Icon size={11} className={cn("mr-1 inline", `text-${meta.tone}`)} />
                  {meta.hint}
                </p>
              </div>

              {/* Intent textarea */}
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Doğal dille niyetini yaz
                </label>
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  rows={4}
                  autoFocus
                  placeholder={FORGE_EXAMPLES[kind][0]}
                  className="mt-1.5 w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
                />
                <p className="mt-1 font-mono text-[10px] text-text-faint">
                  {intent.length < 10
                    ? `Min 10 karakter · şu an ${intent.length}`
                    : `✓ ${intent.length} karakter`}
                </p>
              </div>

              {/* Example intents */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Örnek niyetler · tıkla doldur
                </div>
                <div className="space-y-1.5">
                  {FORGE_EXAMPLES[kind].map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIntent(ex)}
                      className="flex w-full items-start gap-2 rounded-md border border-border/50 bg-elevated/30 px-3 py-2 text-left text-[11px] text-text-muted transition-colors hover:border-nebula/40 hover:bg-nebula-soft/20 hover:text-text"
                    >
                      <Sparkles size={10} className="mt-0.5 shrink-0 text-nebula" />
                      <span>{ex}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div className="font-mono text-[10px] text-text-faint">
                  Workspace: <span className="text-text">{ws.name}</span>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="gap-1.5"
                  onClick={startForge}
                  disabled={intent.trim().length < 10}
                >
                  Oracle Forge
                  <Wand2 size={13} />
                </Button>
              </div>
            </div>
          )}

          {phase === "analyzing" && <AnalyzingStep kind={kind} />}

          {phase === "preview" && forged && forged.confidence > 0 && (
            <PreviewStep
              forged={forged}
              onAccept={accept}
              onBack={() => setPhase("compose")}
            />
          )}

          {phase === "preview" && forged && forged.confidence === 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-crimson/30 bg-crimson-soft/20 p-4 text-sm text-crimson">
                ⚠ {forged.reasoning}
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setPhase("compose")}
              >
                Tekrar dene
              </Button>
            </div>
          )}

          {phase === "accepted" && forged && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-quantum/50 bg-quantum-soft shadow-[0_0_40px_rgba(61,224,168,0.3)]">
                <CheckCircle2 size={26} className="text-quantum" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">
                  {forged.displayName} forge edildi
                </h3>
                <p className="mt-1 text-[12px] text-text-muted">
                  The Archive'da görebilirsin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

// ───────────────────────────────────────────────────────────────────────────
// Analyzing animation
// ───────────────────────────────────────────────────────────────────────────

function AnalyzingStep({ kind }: { kind: ForgeKind }) {
  const meta = KIND_META[kind];
  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-nebula/30 animate-ping" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-nebula/60 bg-nebula-soft/50 text-nebula shadow-[0_0_40px_rgba(155,123,255,0.4)]">
          <Loader2 size={20} className="animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
          Oracle forging {meta.label}
        </div>
        <h3 className="mt-2 text-base font-medium text-text">
          "Everything that has a beginning has an end."
        </h3>
        <p className="mt-0.5 text-[11px] font-mono italic text-text-faint">
          — The Oracle
        </p>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Preview — Forged entity review
// ───────────────────────────────────────────────────────────────────────────

function PreviewStep({
  forged,
  onAccept,
  onBack,
}: {
  forged: ForgedEntity;
  onAccept: () => void;
  onBack: () => void;
}) {
  const confTone =
    forged.confidence >= 75 ? "quantum" : forged.confidence >= 55 ? "ion" : "solar";

  return (
    <div className="space-y-4">
      {/* Header with confidence */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-nebula/30 bg-nebula-soft/15 p-4">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-nebula">
            {forged.kind} · canonical form
          </div>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-elevated/60 px-2 py-0.5 font-mono text-sm text-text">
              {forged.name}
            </code>
            <span className="text-sm text-text-muted">·</span>
            <span className="text-sm font-medium text-text">{forged.displayName}</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-text">
            {forged.summary}
          </p>
        </div>
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border font-mono",
            confTone === "quantum" && "border-quantum/40 bg-quantum-soft text-quantum",
            confTone === "ion" && "border-ion/40 bg-ion-soft text-ion",
            confTone === "solar" && "border-solar/40 bg-solar-soft text-solar"
          )}
        >
          <div className="text-[10px] uppercase tracking-wider">conf</div>
          <div className="text-sm font-semibold">{forged.confidence}%</div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="rounded-md border border-border/60 bg-elevated/30 px-3 py-2 font-mono text-[11px] leading-relaxed text-text-muted">
        <Sparkles size={10} className="mr-1 inline text-nebula" />
        <b className="text-nebula">Oracle:</b> {forged.reasoning}
      </div>

      {/* Kind-specific details */}
      {forged.kind === "skill" && <SkillDetails skill={forged} />}
      {forged.kind === "agent" && <AgentDetails agent={forged} />}
      {forged.kind === "workflow" && <WorkflowDetails workflow={forged} />}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border/40 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[11px] text-text-muted hover:text-text"
        >
          ← Tekrar yaz
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-faint">
            mode: rule-based
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="gap-1.5"
            onClick={onAccept}
          >
            Kabul et + Archive'a ekle
            <CheckCircle2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SkillDetails({ skill: s }: { skill: ForgedSkill }) {
  return (
    <div className="space-y-3 text-[12px]">
      <Row label="Model tercihi">
        <span className="rounded border border-ion/30 bg-ion-soft px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ion">
          claude-{s.modelPreference}
        </span>
      </Row>
      <Row label="Scopes">
        <div className="flex flex-wrap gap-1">
          {s.scopes.map((sc) => (
            <span
              key={sc}
              className={cn(
                "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                sc === "external-send"
                  ? "border-crimson/40 bg-crimson-soft text-crimson"
                  : sc === "write"
                  ? "border-solar/40 bg-solar-soft text-solar"
                  : "border-border/60 bg-elevated text-text-muted"
              )}
            >
              {sc}
            </span>
          ))}
        </div>
      </Row>
      {s.requiredConnectors.length > 0 && (
        <Row label="Gerekli connector'lar">
          <div className="flex flex-wrap gap-1">
            {s.requiredConnectors.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded border border-nebula/30 bg-nebula-soft px-1.5 py-0.5 font-mono text-[10px] text-nebula"
              >
                <Zap size={9} />
                {c.replace(/^c-/, "")}
              </span>
            ))}
          </div>
        </Row>
      )}
      <Row label="Input → Output">
        <div className="font-mono text-[11px]">
          <span className="text-text-muted">
            {s.inputs.map((i) => i.name).join(", ")}
          </span>
          <span className="mx-2 text-text-faint">→</span>
          <span className="text-text">
            {s.outputs.map((o) => o.name).join(", ")}
          </span>
        </div>
      </Row>
    </div>
  );
}

function AgentDetails({ agent: a }: { agent: ForgedAgent }) {
  return (
    <div className="space-y-3 text-[12px]">
      <Row label="Role">
        <span className="font-medium text-text">{a.role}</span>
      </Row>
      <Row label="Model">
        <span className="rounded border border-ion/30 bg-ion-soft px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ion">
          claude-{a.model}
        </span>
      </Row>
      {a.recommendedSkills.length > 0 && (
        <Row label="Önerilen skill'ler">
          <div className="flex flex-wrap gap-1">
            {a.recommendedSkills.map((sk) => (
              <span
                key={sk}
                className="rounded border border-nebula/30 bg-nebula-soft px-1.5 py-0.5 font-mono text-[10px] text-nebula"
              >
                {sk}
              </span>
            ))}
          </div>
        </Row>
      )}
      <Row label="Persona prompt">
        <div className="rounded-md border border-border/60 bg-void/40 p-2 font-mono text-[11px] leading-relaxed text-text-muted">
          {a.personaPrompt}
        </div>
      </Row>
    </div>
  );
}

function WorkflowDetails({ workflow: w }: { workflow: ForgedWorkflow }) {
  return (
    <div className="space-y-3 text-[12px]">
      <div className="flex flex-wrap gap-2">
        <Row label="Cadence">
          <code className="rounded bg-elevated/60 px-1.5 py-0.5 font-mono text-[10px] text-text">
            {w.cadence}
          </code>
        </Row>
        {w.requiresApproval && (
          <span className="inline-flex items-center gap-1 rounded border border-crimson/30 bg-crimson-soft px-1.5 py-0.5 font-mono text-[10px] text-crimson">
            external-send approval
          </span>
        )}
      </div>
      <Row label={`Adımlar · ${w.steps.length}`}>
        <ol className="space-y-1.5">
          {w.steps.map((s, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 rounded-md border border-border/50 bg-elevated/30 px-2.5 py-1.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-quantum/40 bg-quantum-soft font-mono text-[10px] text-quantum">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                    {s.kind}
                  </span>
                  <span className="text-[12px] font-medium text-text">
                    {s.label}
                  </span>
                </div>
                {s.note && (
                  <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                    {s.note}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Row>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
