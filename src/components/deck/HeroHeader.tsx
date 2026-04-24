"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/lib/store";
import {
  agents as allAgents,
  departments as allDepartments,
  goals as allGoals,
  skills as allSkills,
  workflows as allWorkflows,
} from "@/lib/mock-data";
import { scanWorkspace } from "@/lib/oracle";
import { connectors as allConnectorsForHero } from "@/lib/connectors";
import { getBudgetsWithSpend as getBudgetsForHero } from "@/lib/costs";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { MatrixCodeRain } from "../brand/MatrixCodeRain";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";
import { toast } from "@/lib/toast";

export function HeroHeader() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const current = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const suggestions = useMemo(
    () =>
      current
        ? scanWorkspace({
            workspace: current,
            departments: allDepartments.filter((d) => d.workspaceId === current.id),
            agents: allAgents.filter((a) => a.workspaceId === current.id),
            skills: allSkills.filter((s) => s.workspaceId === current.id),
            workflows: allWorkflows.filter((w) => w.workspaceId === current.id),
            goals: allGoals.filter((g) => g.workspaceId === current.id),
            connectors: allConnectorsForHero,
            budgets: getBudgetsForHero(current.id),
          })
        : [],
    [current]
  );
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  const dateStr = now.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

  // Empty portfolio — WorkspaceSwitcher zaten CTA gösteriyor, burada hero'yu
  // kısa bir onboarding mesajına çevir
  if (!current) {
    return (
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-[600px] rounded-full bg-nebula/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <span className="h-px w-6 bg-border-strong" />
            The Construct · {dateStr}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {greeting}, Ferhan.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-muted">
            Portföyün boş. Sol üstteki{" "}
            <span className="text-nebula">workspace seçici</span>&apos;den ilk
            dijital asset&apos;ini ekle — Oracle birkaç soru sorup kurulumu
            senin için bitirsin.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
      {/* Matrix digital rain — subtle, only on Command Deck hero */}
      <MatrixCodeRain tone="quantum" opacity={0.14} columns={18} />

      {/* Subtle aurora */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-[600px] rounded-full bg-ion/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 right-1/4 h-48 w-[500px] rounded-full bg-nebula/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <span className="h-px w-6 bg-border-strong" />
            The Construct · {dateStr}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {greeting}, Ferhan.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-muted">
            <span className="text-text">{current.name}</span> · {current.industry}. Bugün{" "}
            <span className="text-text">3 onay bekleyen</span> aksiyonun, Oracle'dan{" "}
            <span className="text-nebula">{suggestions.length} yeni öneri</span>, ve portföyündeki{" "}
            <span className="text-text">tüm varlıklar</span> için anlık rollup hazır.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/oracle">
            <Button variant="secondary" size="md" className="gap-2">
              <Sparkles size={14} className="text-nebula" />
              Oracle'ı Dinle
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            className="gap-2"
            onClick={() =>
              toast({
                tone: "nebula",
                title: "Haftalık review hazırlanıyor",
                description: `${current.name} için 7 günlük rollup üretildi — The Truth'a düştü.`,
                action: { label: "Aç", href: "/insights" },
              })
            }
          >
            Haftalık review üret
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>

      <div className="relative mt-6 max-w-2xl">
        <MatrixQuote speaker={MODULE_QUOTES["/"].speaker} tone={MODULE_QUOTES["/"].tone}>
          {MODULE_QUOTES["/"].line}
        </MatrixQuote>
      </div>
    </section>
  );
}
