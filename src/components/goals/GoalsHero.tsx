"use client";

import type { Goal, Workspace } from "@/lib/types";
import { Button } from "../ui/Button";
import { Plus, Target } from "lucide-react";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";
import { toast } from "@/lib/toast";

function summarize(goals: Goal[]) {
  const byT: Record<Goal["trajectory"], number> = {
    ahead: 0,
    "on-track": 0,
    "at-risk": 0,
    "off-track": 0,
  };
  goals.forEach((g) => (byT[g.trajectory] += 1));
  return byT;
}

export function GoalsHero({ ws, goals }: { ws: Workspace; goals: Goal[] }) {
  const byT = summarize(goals);
  const onRail = byT.ahead + byT["on-track"];
  const risky = byT["at-risk"] + byT["off-track"];

  return (
    <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
      <MatrixHexGrid tone="quantum" opacity={0.08} />
      <div className="pointer-events-none absolute -top-24 right-1/3 h-48 w-[500px] rounded-full bg-quantum/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 left-1/4 h-40 w-[400px] rounded-full bg-ion/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Target size={12} className="text-quantum" />
            The Prophecy · {ws.name}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {goals.length === 0
              ? "Henüz bir hedef yok."
              : `${goals.length} hedef takipte.`}
          </h1>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            {goals.length === 0
              ? "OKR'lerini tanımla; Matrix her ajan/skill/workflow çalışmasını otomatik olarak ilgili hedefin yörüngesine işler."
              : "Her hedefin yörüngesi stratejik DNA'na ve organizasyonuna bağlıdır. Sapan bir hedef, hangi ajanın hangi skill'inin yavaşladığını sana gösterir."}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Pill label="Rotada" count={onRail} tone="quantum" />
            <Pill label="Risk altında" count={risky} tone="solar" />
            <Pill label="Önde" count={byT.ahead} tone="ion" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "ion",
                title: "Çeyrek raporu üretildi",
                description: `${ws.name} · 2026 Q2 rapor snapshot'ı: ${onRail}/${goals.length} rotada, ${risky} risk.`,
                action: { label: "Captain's Log'da aç", href: "/traction" },
              })
            }
          >
            Çeyrek raporu
          </Button>
          <Button
            variant="primary"
            size="md"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "quantum",
                title: "Yeni OKR",
                description: "OKR editor yakında bu modülde açılacak — bu sprint inspiration + Captain's Log Rock'tan geçiyor.",
                action: { label: "Rock olarak ekle", href: "/traction" },
              })
            }
          >
            <Plus size={14} />
            Yeni OKR
          </Button>
        </div>
      </div>

      <div className="relative mt-6 max-w-3xl">
        <MatrixQuote speaker={MODULE_QUOTES["/goals"].speaker} tone={MODULE_QUOTES["/goals"].tone}>
          {MODULE_QUOTES["/goals"].line}
        </MatrixQuote>
      </div>
    </section>
  );
}

function Pill({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "quantum" | "solar" | "ion";
}) {
  const toneCls =
    tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/30"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/30"
      : "text-ion bg-ion-soft border-ion/30";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${toneCls}`}
    >
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}
