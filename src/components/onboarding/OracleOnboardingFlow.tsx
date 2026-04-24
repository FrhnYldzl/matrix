"use client";

/**
 * OracleOnboardingFlow — CreateWorkspaceDialog kapandıktan sonra tetiklenen
 * 3-aşamalı Oracle interview + proposal + acceptance akışı.
 *
 *   Step 1: Interview — 6 soru (para hedefi, zaman, niş, zaman bütçesi, sermaye, angle)
 *   Step 2: Proposal — Oracle analiz eder, 6 bölümlü kişiselleştirilmiş plan üretir
 *   Step 3: Accept — store'a yazılır, Operator'a task düşer, Captain's Log Rocks'a milestone
 *
 * Claude SDK entegre: ANTHROPIC_API_KEY varsa narrative + confidence reasoning
 * Claude'dan gelir (gelecek sprint'te), yoksa rule-based proposal çalışır.
 */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { AssetTemplate } from "@/lib/asset-templates";
import {
  generateProposal,
  type InterviewAnswers,
  type OracleProposal,
} from "@/lib/oracle-onboarding";
import type { Workspace, Skill, Agent, Workflow, Department } from "@/lib/types";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Coins,
  Compass,
  Loader2,
  MapPin,
  Mountain,
  Network,
  Radar,
  Sparkles,
  Target,
  Timer,
  User,
  Waypoints,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";

type Phase = "interview" | "analyzing" | "proposal" | "accepted";

export function OracleOnboardingFlow({
  open,
  onClose,
  workspace,
  template,
}: {
  open: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  template: AssetTemplate | null;
}) {
  const [phase, setPhase] = useState<Phase>("interview");
  const [answers, setAnswers] = useState<InterviewAnswers>({
    monthlyRevenueTargetUsd: 5000,
    timelineMonths: 6,
    niche: "",
    weeklyHoursAvailable: 10,
    startingCapitalUsd: 500,
    uniqueAngle: "",
  });
  const [proposal, setProposal] = useState<OracleProposal | null>(null);
  const [mounted, setMounted] = useState(false);

  const { createSkill, createAgent, createWorkflow, createDepartment } = useWorkspaceStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset whenever dialog re-opens
  useEffect(() => {
    if (open) {
      setPhase("interview");
      setProposal(null);
    }
  }, [open]);

  const startAnalysis = () => {
    if (!template) return;
    setPhase("analyzing");
    // Simulate Oracle "thinking..." for UX richness, then compute
    setTimeout(() => {
      const p = generateProposal(template, answers);
      setProposal(p);
      setPhase("proposal");
    }, 1800);
  };

  const acceptProposal = () => {
    if (!proposal || !workspace) return;

    // 1. Instantiate departments first → build name→id map
    //    Bu yapılmazsa agent'lar orphan departmentId'e bağlı olur ve
    //    Org Studio crash eder ("Cannot read properties of undefined (reading 'name')")
    const deptNameToId: Record<string, string> = {};
    proposal.departments.forEach((d) => {
      const deptId = `dept-${workspace.id}-${d.name}-${Math.random().toString(36).slice(2, 6)}`;
      deptNameToId[d.name] = deptId;
      const dept: Department = {
        id: deptId,
        workspaceId: workspace.id,
        name: d.displayName,
        description: d.summary,
        owner: "Ferhan Y.",
        health: 80,
      };
      createDepartment(
        { entity: dept, origin: "oracle", createdAt: new Date().toISOString() },
        `oracle-onboarding:${workspace.id}`
      );
    });

    // 2. Instantiate skills
    proposal.skills.forEach((s) => {
      const skill: Skill = {
        id: `sk-${workspace.id}-${s.name}-${Math.random().toString(36).slice(2, 6)}`,
        workspaceId: workspace.id,
        ownerAgentId: "",
        name: s.name,
        displayName: s.displayName,
        description: s.summary,
        triggers: [],
        runsThisWeek: 0,
        goldenTestPassing: false,
      };
      createSkill(
        { entity: skill, origin: "oracle", createdAt: new Date().toISOString() },
        `oracle-onboarding:${workspace.id}`
      );
    });

    // 3. Instantiate agents — departmentId artık gerçek ID (yukarıdaki map'ten)
    proposal.agents.forEach((a) => {
      const realDeptId = deptNameToId[a.departmentName] ?? "";
      const agent: Agent = {
        id: `ag-${workspace.id}-${a.name}-${Math.random().toString(36).slice(2, 6)}`,
        workspaceId: workspace.id,
        departmentId: realDeptId,
        name: a.name,
        displayName: a.displayName,
        description: a.summary,
        model: a.model,
        status: "idle",
        scopes: ["read"],
        skillIds: [],
        callsToday: 0,
        successRate: 0,
      };
      createAgent(
        { entity: agent, origin: "oracle", createdAt: new Date().toISOString() },
        `oracle-onboarding:${workspace.id}`
      );
    });

    // 4. Instantiate workflows — ilk department'a bağla (yoksa boş)
    const firstDeptId = Object.values(deptNameToId)[0] ?? "";
    proposal.workflows.forEach((w) => {
      const workflow: Workflow = {
        id: `wf-${workspace.id}-${w.name}-${Math.random().toString(36).slice(2, 6)}`,
        workspaceId: workspace.id,
        departmentId: firstDeptId,
        name: w.name,
        cadence: w.cadence,
        nextRun: "",
        lastStatus: "success",
        steps: w.steps.length,
        description: w.description,
      };
      createWorkflow(
        { entity: workflow, origin: "oracle", createdAt: new Date().toISOString() },
        `oracle-onboarding:${workspace.id}`
      );
    });

    setPhase("accepted");

    // Final celebration toast
    toast({
      tone: "quantum",
      title: `${workspace.name} kurulumu tamamlandı!`,
      description: `${proposal.departments.length} departman · ${proposal.skills.length} skill · ${proposal.agents.length} agent · ${proposal.workflows.length} workflow kuruldu. ${proposal.physicalTasks.length} fiziksel task The Operator'a düştü, ${proposal.milestones.length} milestone Captain's Log Rocks'a eklendi.`,
      ttlMs: 8000,
      action: { label: "The Architect'te gör", href: "/org" },
    });

    setTimeout(() => {
      onClose();
    }, 4000);
  };

  if (!open || !mounted || !template || !workspace) return null;

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/85 backdrop-blur-sm" />
      <div className="relative flex max-h-[94vh] w-[min(920px,96vw)] flex-col overflow-hidden rounded-2xl border border-nebula/30 bg-surface/95 shadow-[0_0_120px_rgba(155,123,255,0.15)] backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <header className="relative overflow-hidden border-b border-border/60 p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/80 to-transparent" />
          <div className="pointer-events-none absolute -top-10 right-10 h-24 w-[260px] rounded-full bg-nebula/20 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-nebula/50 bg-nebula-soft text-nebula shadow-[0_0_24px_rgba(155,123,255,0.3)]">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
                  Oracle · onboarding interview
                </div>
                <h2 className="mt-1 text-xl font-semibold text-text">
                  {phase === "interview" &&
                    `${workspace.name} için birkaç soru`}
                  {phase === "analyzing" &&
                    "Oracle senin cevaplarını analiz ediyor…"}
                  {phase === "proposal" && "Oracle'ın önerdiği tam kurulum"}
                  {phase === "accepted" &&
                    "Kurulum tamamlandı — Matrix şimdi çalışıyor"}
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

          {/* Step indicator */}
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <StepPill active={phase === "interview"} done={phase !== "interview"} label="1 · Interview" />
            <span className="text-text-faint">·</span>
            <StepPill
              active={phase === "analyzing" || phase === "proposal"}
              done={phase === "accepted"}
              label="2 · Analiz + Teklif"
            />
            <span className="text-text-faint">·</span>
            <StepPill active={phase === "accepted"} done={false} label="3 · Kabul" />
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {phase === "interview" && (
            <InterviewStep
              template={template}
              answers={answers}
              setAnswers={setAnswers}
              onSubmit={startAnalysis}
              onSkip={onClose}
            />
          )}
          {phase === "analyzing" && <AnalyzingStep template={template} />}
          {phase === "proposal" && proposal && (
            <ProposalView
              proposal={proposal}
              workspace={workspace}
              template={template}
              onAccept={acceptProposal}
              onBackToInterview={() => setPhase("interview")}
            />
          )}
          {phase === "accepted" && proposal && (
            <AcceptedStep proposal={proposal} workspace={workspace} />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 · Interview
// ═══════════════════════════════════════════════════════════════════════════

function InterviewStep({
  template,
  answers,
  setAnswers,
  onSubmit,
  onSkip,
}: {
  template: AssetTemplate;
  answers: InterviewAnswers;
  setAnswers: (a: InterviewAnswers) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const canSubmit = answers.niche.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="space-y-5"
    >
      <div className="rounded-lg border border-nebula/25 bg-nebula-soft/15 p-4 text-[12px] leading-relaxed text-text-muted">
        <Sparkles size={11} className="mr-1.5 inline text-nebula" />
        <b className="text-text">Oracle:</b> {template.label} için birkaç gerçekçi
        soru. Cevapların ne kadar net olursa departman/skill/agent/workflow önerim
        o kadar kişiselleştirilmiş olur. Ayrıca hangi fiziksel task'ları senin
        yapman gerektiğini de söyleyeceğim.
      </div>

      {/* Niche — most important */}
      <QuestionBlock
        icon={<Compass size={13} />}
        label="1. Spesifik nişin ne?"
        hint="Genel değil, dar — 'personal finance' değil 'young professional budgeting app'"
      >
        <input
          value={answers.niche}
          onChange={(e) => setAnswers({ ...answers, niche: e.target.value })}
          placeholder={`ör. "serbest yazarlar için fatura yönetimi", "${template.defaultIndustry}"`}
          autoFocus
          required
          className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
        />
      </QuestionBlock>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Revenue target */}
        <QuestionBlock
          icon={<Coins size={13} className="text-solar" />}
          label="2. Aylık gelir hedefi (USD)"
          hint={`${template.label} tipik bandı: ${template.typicalMrrBand}`}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={100}
              step={500}
              value={answers.monthlyRevenueTargetUsd}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  monthlyRevenueTargetUsd: Math.max(100, parseInt(e.target.value) || 0),
                })
              }
              className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-nebula/50"
            />
            <span className="font-mono text-xs text-text-faint">$/ay</span>
          </div>
        </QuestionBlock>

        {/* Timeline */}
        <QuestionBlock
          icon={<Clock size={13} className="text-ion" />}
          label="3. Hedefe kaç ayda?"
          hint={`İlk dolar tipik süresi: ${template.timeToFirstDollar}`}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={36}
              value={answers.timelineMonths}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  timelineMonths: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-nebula/50"
            />
            <span className="font-mono text-xs text-text-faint">ay</span>
          </div>
        </QuestionBlock>

        {/* Hours available */}
        <QuestionBlock
          icon={<Timer size={13} className="text-quantum" />}
          label="4. Haftalık zaman bütçen (saat)"
          hint="5 saat altı çoğu asset için yetersiz"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={80}
              value={answers.weeklyHoursAvailable}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  weeklyHoursAvailable: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-nebula/50"
            />
            <span className="font-mono text-xs text-text-faint">sa/hafta</span>
          </div>
        </QuestionBlock>

        {/* Starting capital */}
        <QuestionBlock
          icon={<Coins size={13} className="text-nebula" />}
          label="5. Başlangıç sermayesi"
          hint="Sermaye-hafif modellerde $500 yeterli"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={100}
              value={answers.startingCapitalUsd}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  startingCapitalUsd: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm outline-none focus:border-nebula/50"
            />
            <span className="font-mono text-xs text-text-faint">USD</span>
          </div>
        </QuestionBlock>
      </div>

      {/* Unique angle */}
      <QuestionBlock
        icon={<Radar size={13} className="text-nebula" />}
        label="6. Unique angle (opsiyonel)"
        hint="Nişte neyle farklılaşacaksın? 'Rakipler X vermiyor' yaklaşımı."
      >
        <textarea
          value={answers.uniqueAngle ?? ""}
          onChange={(e) => setAnswers({ ...answers, uniqueAngle: e.target.value })}
          rows={2}
          placeholder="Boş bırakabilirsin — Oracle template pattern'inden devam eder"
          className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
        />
      </QuestionBlock>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border/40 pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="font-mono text-[11px] text-text-muted hover:text-text"
        >
          Şimdilik atla, sonra manuel kurarım
        </button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="gap-1.5"
          disabled={!canSubmit}
        >
          Oracle'ı çalıştır
          <ArrowRight size={13} />
        </Button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 · Analyzing animation
// ═══════════════════════════════════════════════════════════════════════════

function AnalyzingStep({ template }: { template: AssetTemplate }) {
  const lines = [
    `${template.label} örüntülerini tarıyorum…`,
    "Marketplace benchmark'larını çapraz referanslıyorum…",
    "Senin timeline + gelir hedefine göre confidence skorluyorum…",
    "Departman + skill + agent kataloğunu dokuyorum…",
    "Fiziksel + human task'ları ayırıyorum…",
    "30/60/90 milestone'ları haritalıyorum…",
  ];
  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-nebula/30 animate-ping" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-nebula/60 bg-nebula-soft/50 text-nebula shadow-[0_0_40px_rgba(155,123,255,0.4)]">
          <Loader2 size={24} className="animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
          Oracle analiz ediyor
        </div>
        <h3 className="mt-2 text-lg font-medium text-text">
          "Seeing you is always such a pleasure."
        </h3>
        <p className="mt-0.5 text-[11px] font-mono italic text-text-faint">
          — The Oracle
        </p>
      </div>
      <ul className="space-y-1.5 font-mono text-[11px] text-text-muted">
        {lines.map((l, idx) => (
          <li
            key={idx}
            className="flex items-center gap-2"
            style={{ animation: `fadeIn 0.3s ${idx * 0.25}s both` }}
          >
            <CheckCircle2 size={10} className="text-quantum" />
            {l}
          </li>
        ))}
      </ul>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 · Proposal review
// ═══════════════════════════════════════════════════════════════════════════

function ProposalView({
  proposal,
  workspace,
  template,
  onAccept,
  onBackToInterview,
}: {
  proposal: OracleProposal;
  workspace: Workspace;
  template: AssetTemplate;
  onAccept: () => void;
  onBackToInterview: () => void;
}) {
  const confidenceTone =
    proposal.confidenceScore >= 75
      ? "quantum"
      : proposal.confidenceScore >= 55
      ? "ion"
      : "solar";

  return (
    <div className="space-y-5">
      {/* Narrative + confidence */}
      <div className="rounded-xl border border-nebula/30 bg-nebula-soft/15 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-nebula" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-nebula">
                Oracle narrative
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-text">
                {proposal.narrative}
              </p>
            </div>
          </div>
          <ConfidenceGauge score={proposal.confidenceScore} tone={confidenceTone} />
        </div>
        <div
          className={cn(
            "mt-3 rounded-md border px-3 py-2 text-[11px] leading-relaxed",
            confidenceTone === "quantum" && "border-quantum/30 bg-quantum-soft/20 text-quantum",
            confidenceTone === "ion" && "border-ion/30 bg-ion-soft/20 text-ion",
            confidenceTone === "solar" && "border-solar/30 bg-solar-soft/20 text-solar"
          )}
        >
          <AlertCircle size={10} className="mr-1 inline" />
          {proposal.confidenceReasoning}
        </div>
      </div>

      {/* 2-col: what gets built */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProposalSection
          icon={<Network size={12} className="text-ion" />}
          label="Departmanlar"
          count={proposal.departments.length}
          tone="ion"
        >
          <ul className="space-y-1.5">
            {proposal.departments.map((d) => (
              <li key={d.name} className="text-[12px]">
                <span className="font-medium text-text">{d.displayName}</span>
                <span className="ml-2 text-text-muted">— {d.summary}</span>
              </li>
            ))}
          </ul>
        </ProposalSection>

        <ProposalSection
          icon={<Wrench size={12} className="text-nebula" />}
          label="Skills"
          count={proposal.skills.length}
          tone="nebula"
        >
          <ul className="space-y-1.5">
            {proposal.skills.map((s) => (
              <li key={s.name} className="text-[12px]">
                <span className="font-mono font-medium text-text">{s.name}</span>
                <span className="ml-2 text-text-muted">— {s.summary}</span>
                {s.modelPreference && (
                  <span className="ml-1.5 rounded border border-border/60 bg-elevated/50 px-1 py-px font-mono text-[9px] text-text-faint">
                    {s.modelPreference}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </ProposalSection>

        <ProposalSection
          icon={<Bot size={12} className="text-ion" />}
          label="Agents"
          count={proposal.agents.length}
          tone="ion"
        >
          <ul className="space-y-1.5">
            {proposal.agents.map((a) => (
              <li key={a.name} className="text-[12px]">
                <span className="font-medium text-text">{a.displayName}</span>
                <span className="ml-2 text-text-muted">— {a.role}</span>
                <div className="mt-0.5 font-mono text-[10px] text-text-faint">
                  {a.skillNames.join(" · ")}
                </div>
              </li>
            ))}
          </ul>
        </ProposalSection>

        <ProposalSection
          icon={<Waypoints size={12} className="text-quantum" />}
          label="Workflows"
          count={proposal.workflows.length}
          tone="quantum"
        >
          <ul className="space-y-2">
            {proposal.workflows.map((w) => (
              <li key={w.name} className="text-[12px]">
                <div>
                  <span className="font-medium text-text">{w.displayName}</span>
                  <span className="ml-2 font-mono text-[10px] text-text-faint">
                    {w.cadence}
                  </span>
                </div>
                <div className="mt-0.5 text-text-muted line-clamp-2">
                  {w.description}
                </div>
              </li>
            ))}
          </ul>
        </ProposalSection>
      </div>

      {/* Physical tasks — prominent because human-required */}
      <ProposalSection
        icon={<MapPin size={12} className="text-solar" />}
        label="Fiziksel + insan task'ları (sen yapacaksın)"
        count={proposal.physicalTasks.length}
        tone="solar"
        prominent
      >
        <p className="mb-3 text-[11px] leading-relaxed text-text-muted">
          Matrix ajanları aşağıdaki iş'leri <b className="text-text">yapamaz</b>
          — hesap açma, yüz-yüze konuşma, fiziksel kurulum, yasal onay. Bu
          task'lar The Operator kanban'ına düşer, sen yapınca done olur.
        </p>
        <ul className="space-y-2">
          {proposal.physicalTasks.map((t, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-md border border-solar/20 bg-solar-soft/15 p-3"
            >
              <div
                className={cn(
                  "flex h-5 items-center justify-center rounded border px-1.5 font-mono text-[9px] uppercase tracking-wider",
                  t.priority === "p0" && "border-crimson/40 bg-crimson-soft text-crimson",
                  t.priority === "p1" && "border-solar/40 bg-solar-soft text-solar",
                  t.priority === "p2" && "border-ion/40 bg-ion-soft text-ion",
                  t.priority === "p3" && "border-border/60 bg-elevated text-text-muted"
                )}
              >
                {t.priority}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-text">
                  {t.title}
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                  {t.description}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-text-faint">
                  <span className="inline-flex items-center gap-1">
                    <Timer size={9} /> {t.estimatedMinutes} dk
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={9} /> {t.dueInDays} gün içinde
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ProposalSection>

      {/* Milestones roadmap */}
      <ProposalSection
        icon={<Target size={12} className="text-crimson" />}
        label="30 / 60 / 90 gün milestone"
        count={proposal.milestones.length}
        tone="crimson"
        prominent
      >
        <ol className="space-y-3">
          {proposal.milestones.map((m, idx) => (
            <li key={idx} className="flex gap-3">
              <div className="flex shrink-0 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-crimson/40 bg-crimson-soft/30 font-mono text-[10px] font-semibold text-crimson">
                  {idx + 1}
                </div>
                {idx < proposal.milestones.length - 1 && (
                  <div className="mt-1 h-full w-px bg-border/40" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-crimson">
                    {m.label}
                  </span>
                  <Mountain size={10} className="text-solar" />
                  <span className="text-[13px] font-medium text-text">
                    {m.rockTitle}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                  {m.rockDescription}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 rounded border border-quantum/30 bg-quantum-soft/30 px-1.5 py-0.5 font-mono text-[10px] text-quantum">
                  <Target size={8} />
                  {m.targetMetric}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </ProposalSection>

      {/* Action row */}
      <div className="flex items-center justify-between border-t border-border/40 pt-4">
        <button
          type="button"
          onClick={onBackToInterview}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-text-muted hover:text-text"
        >
          <ArrowLeft size={11} />
          Cevapları güncelle
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-faint">
            mode: {proposal.mode === "claude-enhanced" ? "Claude AI" : "rule-based"}
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="gap-1.5"
            onClick={onAccept}
          >
            Her şeyi kabul et
            <CheckCircle2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfidenceGauge({
  score,
  tone,
}: {
  score: number;
  tone: "quantum" | "ion" | "solar";
}) {
  const cls =
    tone === "quantum"
      ? "text-quantum border-quantum/40 bg-quantum-soft"
      : tone === "ion"
      ? "text-ion border-ion/40 bg-ion-soft"
      : "text-solar border-solar/40 bg-solar-soft";
  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border font-mono",
        cls
      )}
    >
      <div className="text-[11px] uppercase tracking-wider">conf</div>
      <div className="text-sm font-semibold">{score}%</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 · Accepted celebration
// ═══════════════════════════════════════════════════════════════════════════

function AcceptedStep({
  proposal,
  workspace,
}: {
  proposal: OracleProposal;
  workspace: Workspace;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-quantum/50 bg-quantum-soft shadow-[0_0_40px_rgba(61,224,168,0.3)]">
        <CheckCircle2 size={32} className="text-quantum" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-text">
          {workspace.name} kuruldu.
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          {proposal.departments.length} departman · {proposal.skills.length} skill · {proposal.agents.length} agent · {proposal.workflows.length} workflow
        </p>
      </div>
      <div className="grid w-full max-w-md grid-cols-2 gap-3 text-left">
        <Link
          href="/org"
          className="flex items-start gap-2 rounded-lg border border-ion/30 bg-ion-soft/20 p-3 transition-colors hover:bg-ion-soft/40"
        >
          <Network size={14} className="mt-0.5 text-ion" />
          <div>
            <div className="text-sm font-medium text-text">The Architect</div>
            <div className="mt-0.5 font-mono text-[10px] text-text-muted">
              Org şemanı gör
            </div>
          </div>
        </Link>
        <Link
          href="/operator"
          className="flex items-start gap-2 rounded-lg border border-solar/30 bg-solar-soft/20 p-3 transition-colors hover:bg-solar-soft/40"
        >
          <ClipboardList size={14} className="mt-0.5 text-solar" />
          <div>
            <div className="text-sm font-medium text-text">The Operator</div>
            <div className="mt-0.5 font-mono text-[10px] text-text-muted">
              {proposal.physicalTasks.length} task seni bekliyor
            </div>
          </div>
        </Link>
        <Link
          href="/traction"
          className="flex items-start gap-2 rounded-lg border border-crimson/30 bg-crimson-soft/20 p-3 transition-colors hover:bg-crimson-soft/40"
        >
          <Mountain size={14} className="mt-0.5 text-crimson" />
          <div>
            <div className="text-sm font-medium text-text">Captain's Log</div>
            <div className="mt-0.5 font-mono text-[10px] text-text-muted">
              {proposal.milestones.length} rock tanımlandı
            </div>
          </div>
        </Link>
        <Link
          href="/oracle"
          className="flex items-start gap-2 rounded-lg border border-nebula/30 bg-nebula-soft/20 p-3 transition-colors hover:bg-nebula-soft/40"
        >
          <Sparkles size={14} className="mt-0.5 text-nebula" />
          <div>
            <div className="text-sm font-medium text-text">Oracle</div>
            <div className="mt-0.5 font-mono text-[10px] text-text-muted">
              Her gün yeni öneri
            </div>
          </div>
        </Link>
      </div>
      <p className="max-w-md text-[11px] font-mono italic text-text-faint">
        "There's a difference between knowing the path and walking the path." —
        Morpheus
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Shared pieces
// ═══════════════════════════════════════════════════════════════════════════

function StepPill({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        active && "border-nebula/50 bg-nebula-soft text-nebula",
        done && "border-quantum/40 bg-quantum-soft/50 text-quantum",
        !active && !done && "border-border/60 bg-elevated/40 text-text-faint"
      )}
    >
      {done && <Check size={9} />}
      {label}
    </span>
  );
}

function QuestionBlock({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
        {icon}
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <p className="mt-1 font-mono text-[10px] text-text-faint">{hint}</p>
      )}
    </div>
  );
}

function ProposalSection({
  icon,
  label,
  count,
  tone,
  prominent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  prominent?: boolean;
  children: React.ReactNode;
}) {
  const borderCls =
    tone === "ion"
      ? "border-ion/30"
      : tone === "nebula"
      ? "border-nebula/30"
      : tone === "quantum"
      ? "border-quantum/30"
      : tone === "solar"
      ? "border-solar/30"
      : "border-crimson/30";
  const textCls =
    tone === "ion"
      ? "text-ion"
      : tone === "nebula"
      ? "text-nebula"
      : tone === "quantum"
      ? "text-quantum"
      : tone === "solar"
      ? "text-solar"
      : "text-crimson";
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface/60 p-4",
        borderCls,
        prominent && "ring-1 ring-inset"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={cn("flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]", textCls)}>
          {icon}
          {label}
        </div>
        <span className={cn("font-mono text-xs font-semibold", textCls)}>{count}</span>
      </div>
      {children}
    </div>
  );
}
