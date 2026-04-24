"use client";

import {
  agents as seedAgents,
  departments as seedDepartments,
  skills as seedSkills,
  workflows as seedWorkflows,
} from "@/lib/mock-data";
import { blueprints } from "@/lib/blueprints";
import { useWorkspaceStore } from "@/lib/store";
import { useMemo } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import Link from "next/link";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Shows a prominent CTA if the current workspace looks "thin" — few departments,
 * few agents, or specific domain gaps — and recommends a relevant blueprint.
 */
export function BlueprintSuggestionBanner() {
  const {
    currentWorkspaceId,
    workspaces,
    createdAgents,
    createdDepartments,
    createdSkills,
    createdWorkflows,
  } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  const stats = useMemo(() => {
    if (!ws) return { deps: 0, ags: 0, sks: 0, wfs: 0 };
    const deps =
      seedDepartments.filter((d) => d.workspaceId === ws.id).length +
      createdDepartments.filter((c) => c.entity.workspaceId === ws.id).length;
    const ags =
      seedAgents.filter((a) => a.workspaceId === ws.id).length +
      createdAgents.filter((c) => c.entity.workspaceId === ws.id).length;
    const sks =
      seedSkills.filter((s) => s.workspaceId === ws.id).length +
      createdSkills.filter((c) => c.entity.workspaceId === ws.id).length;
    const wfs =
      seedWorkflows.filter((w) => w.workspaceId === ws.id).length +
      createdWorkflows.filter((c) => c.entity.workspaceId === ws.id).length;
    return { deps, ags, sks, wfs };
  }, [ws, createdAgents, createdSkills, createdWorkflows, createdDepartments]);

  const recommendation = useMemo(() => {
    if (!ws) return blueprints[0];
    const miss = missingDomains(ws, {
      agents: [
        ...seedAgents.filter((a) => a.workspaceId === ws.id),
        ...createdAgents
          .filter((c) => c.entity.workspaceId === ws.id)
          .map((c) => c.entity),
      ],
      skills: [
        ...seedSkills.filter((s) => s.workspaceId === ws.id),
        ...createdSkills
          .filter((c) => c.entity.workspaceId === ws.id)
          .map((c) => c.entity),
      ],
    });
    // Pick the first blueprint whose domain is in the missing list
    for (const bp of blueprints) {
      if (miss.includes(bp.domain)) return bp;
    }
    // Otherwise suggest the flagship
    return blueprints[0];
  }, [ws, createdAgents, createdSkills]);

  if (!ws) return null;

  // Threshold: fewer than 5 agents + fewer than 8 skills = thin workspace
  const thin = stats.ags < 6 || stats.sks < 8;
  if (!thin) return null;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-32 w-64 rounded-full bg-solar/15 blur-3xl" />
        <div className="absolute -bottom-10 left-0 h-32 w-64 rounded-full bg-ion/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-start gap-5 p-5 lg:flex-row lg:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-solar/40 bg-solar-soft text-solar shadow-[0_0_24px_rgba(255,181,71,0.25)]">
          <Rocket size={20} strokeWidth={1.6} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-solar">
              Kurulum önerisi
            </span>
            <Sparkles size={11} className="text-nebula" />
          </div>
          <h3 className="mt-1.5 text-lg font-semibold text-text">
            Bu workspace ince görünüyor — tam bir departman kurmak ister misin?
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">
            Şu an <b>{ws.name}</b>'de {stats.deps} departman · {stats.ags} agent · {stats.sks}{" "}
            skill · {stats.wfs} workflow var. Bir blueprint seç, Matrix 12 dakikada tam bir{" "}
            <b className="text-text">{recommendation.displayName}</b> paketi kursun:
            <span className="ml-1 font-mono text-[11px] text-text-muted">
              {recommendation.agents.length} agent · {recommendation.skills.length} skill ·{" "}
              {recommendation.workflows.length} workflow
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 lg:items-end">
          <Link href="/blueprints">
            <Button variant="primary" size="md" className="gap-1.5">
              Blueprint seç
              <ArrowRight size={14} />
            </Button>
          </Link>
          <span className="font-mono text-[10px] text-text-faint">
            ~{recommendation.estimatedMonthlyHoursSaved} sa / ay kazanç · %
            {recommendation.digitalCoverage} dijital
          </span>
        </div>
      </div>
    </Card>
  );
}

function missingDomains(
  _ws: { strategicThemes: { label: string }[]; mission: string },
  ctx: {
    agents: { name: string; description: string }[];
    skills: { name: string; description: string }[];
  }
): string[] {
  const text = [
    ...ctx.agents.map((a) => `${a.name} ${a.description}`),
    ...ctx.skills.map((s) => `${s.name} ${s.description}`),
  ]
    .join(" | ")
    .toLowerCase();

  const out: string[] = [];
  if (!/(sales|lead|pipeline|outreach|marketing|crm|campaign)/.test(text))
    out.push("sales-marketing");
  if (!/(customer|onboard|support|renewal|churn|health)/.test(text))
    out.push("customer-success");
  if (!/(finance|cash|burn|revenue|invoice|expense|bank)/.test(text))
    out.push("finance");
  return out;
}
