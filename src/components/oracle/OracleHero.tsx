"use client";

import type { Suggestion } from "@/lib/oracle";
import { summarize } from "@/lib/oracle";
import { Sparkles, RefreshCcw } from "lucide-react";
import { Button } from "../ui/Button";
import type { Workspace } from "@/lib/types";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";

export function OracleHero({
  ws,
  suggestions,
  onRescan,
  scanning,
}: {
  ws: Workspace;
  suggestions: Suggestion[];
  onRescan: () => void;
  scanning: boolean;
}) {
  const sum = summarize(suggestions);
  const lastScan = new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
      <MatrixHexGrid tone="nebula" opacity={0.08} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/3 h-56 w-[500px] rounded-full bg-nebula/15 blur-3xl" />
        <div className="absolute -top-10 right-1/3 h-40 w-[400px] rounded-full bg-ion/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Sparkles size={12} className="text-nebula" />
            Oracle · son tarama {lastScan}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {sum.total === 0 ? "Her şey yolunda." : `${sum.total} öneri hazır.`}
          </h1>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            <span className="text-text">{ws.name}</span>'i stratejik DNA'sına, ajan yapısına ve
            operasyonel sinyallere göre taradım. Kabul ettiğin öneri anında organizasyon şemana
            düşer; reddettiklerini unutmam — bir dahakine gerekçeni sorarım.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatPill
              count={sum.byPrio.high}
              label="Yüksek öncelik"
              tone="crimson"
            />
            <StatPill count={sum.byKind.gap} label="Boşluk" tone="ion" />
            <StatPill count={sum.byKind.strategy} label="Hiza" tone="nebula" />
            <StatPill count={sum.byKind.ops} label="Ops" tone="quantum" />
            <StatPill count={sum.byKind.risk} label="Risk" tone="solar" />
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <Button
            variant="primary"
            size="md"
            className="gap-1.5"
            onClick={onRescan}
            disabled={scanning}
          >
            <RefreshCcw size={14} className={scanning ? "animate-spin" : ""} />
            {scanning ? "Taranıyor…" : "Tekrar tara"}
          </Button>
          <span className="font-mono text-[10px] text-text-faint">
            Kural motoru · yakında Claude API entegrasyonu
          </span>
        </div>
      </div>

      <div className="relative mt-6 max-w-3xl">
        <MatrixQuote speaker={MODULE_QUOTES["/oracle"].speaker} tone={MODULE_QUOTES["/oracle"].tone}>
          {MODULE_QUOTES["/oracle"].line}
        </MatrixQuote>
      </div>
    </section>
  );
}

function StatPill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
}) {
  const toneCls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/30"
      : tone === "nebula"
      ? "text-nebula bg-nebula-soft border-nebula/30"
      : tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/30"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/30"
      : "text-crimson bg-crimson-soft border-crimson/30";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${toneCls}`}
    >
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}
