"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { hunterSignals, type HunterSignal } from "@/lib/business-library";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Activity,
  ChevronDown,
  Filter,
  Radar,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

const sourceLabel: Record<HunterSignal["source"], string> = {
  twitter: "Twitter",
  reddit: "Reddit",
  producthunt: "Product Hunt",
  "amazon-movers": "Amazon Movers",
  "etsy-trending": "Etsy Trending",
  "shopify-apps": "Shopify Apps",
  "google-trends": "Google Trends",
  youtube: "YouTube",
};

const strengthMeta: Record<
  HunterSignal["signalStrength"],
  { label: string; tone: "quantum" | "ion" | "solar" }
> = {
  strong: { label: "Güçlü sinyal", tone: "quantum" },
  emerging: { label: "Yükseliyor", tone: "ion" },
  weak: { label: "Zayıf", tone: "solar" },
};

const verdictMeta: Record<
  HunterSignal["verdict"],
  { label: string; cls: string }
> = {
  "worth-exploring": {
    label: "İncelenmeli",
    cls: "text-quantum border-quantum/40 bg-quantum-soft",
  },
  "needs-more-signal": {
    label: "Daha çok sinyal gerek",
    cls: "text-solar border-solar/40 bg-solar-soft",
  },
  skip: { label: "Atla", cls: "text-text-muted border-border bg-elevated" },
};

export function HunterAgentPanel() {
  const [expanded, setExpanded] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [digitalOnly, setDigitalOnly] = useState(true);

  const visible = useMemo(() => {
    return hunterSignals
      .filter((s) => !digitalOnly || s.digitalShare >= 80)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  }, [digitalOnly]);

  const rescan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 900);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
      <div className="pointer-events-none absolute -top-10 right-0 h-36 w-72 rounded-full bg-nebula/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 left-0 h-36 w-72 rounded-full bg-ion/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 border-b border-border/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-nebula/40 bg-nebula-soft text-nebula shadow-[0_0_24px_rgba(155,123,255,0.3)]">
            <Radar size={20} strokeWidth={1.6} className={scanning ? "animate-spin" : "animate-breathe"} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              <Sparkles size={11} className="text-nebula" />
              Hunter Agent · fırsat tarayıcı
            </div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-text">
              {scanning
                ? "Tarama yapılıyor…"
                : `${visible.length} yeni fırsat bulundu`}
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Twitter · Reddit · Product Hunt · Amazon Movers · Etsy Trending · Google Trends &
              daha fazlasını sürekli tarıyor. %80+ dijital gelirli işleri öne çıkarır.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setDigitalOnly((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              digitalOnly
                ? "border-quantum/40 bg-quantum-soft text-quantum"
                : "border-border/60 bg-elevated/50 text-text-muted hover:text-text"
            )}
          >
            <Filter size={11} />
            %80+ dijital
          </button>
          <Button variant="secondary" size="sm" className="gap-1.5" onClick={rescan}>
            <RefreshCcw size={12} className={scanning ? "animate-spin" : ""} />
            Tara
          </Button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-border/60 p-2 text-text-muted transition-colors hover:text-text"
            aria-label={expanded ? "Daralt" : "Genişlet"}
          >
            <ChevronDown
              size={14}
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <ul className="relative grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          {visible.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function SignalCard({ signal }: { signal: HunterSignal }) {
  const str = strengthMeta[signal.signalStrength];
  const verdict = verdictMeta[signal.verdict];

  const ago = (() => {
    const diff = Math.max(0, (Date.now() - new Date(signal.capturedAt).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa`;
    return `${Math.floor(diff / 86400)} gün`;
  })();

  return (
    <li
      className={cn(
        "group relative flex flex-col rounded-lg border border-border/60 bg-elevated/40 p-4 transition-colors hover:border-border-strong"
      )}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-faint">
        <Activity size={10} />
        {sourceLabel[signal.source]}
        <span className="ml-auto">{ago} önce</span>
      </div>

      <h4 className="mt-2 text-sm font-medium leading-snug text-text">{signal.title}</h4>
      <p className="mt-1.5 text-xs leading-relaxed text-text-muted line-clamp-3">
        {signal.summary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            str.tone === "quantum" && "text-quantum border-quantum/40 bg-quantum-soft",
            str.tone === "ion" && "text-ion border-ion/40 bg-ion-soft",
            str.tone === "solar" && "text-solar border-solar/40 bg-solar-soft"
          )}
        >
          {str.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-ion/30 bg-ion-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ion">
          %{signal.digitalShare} dijital
        </span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            verdict.cls
          )}
        >
          {verdict.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-3 border-t border-border/40 pt-3 font-mono text-[11px] text-text-muted">
        <span>
          <span className="text-text-faint">Sermaye:</span>{" "}
          <span className="text-text">{signal.estimatedResourceProfile.capital.level}</span>
          {signal.estimatedResourceProfile.capital.minUsd != null && (
            <span className="ml-1 text-text-muted">
              (${signal.estimatedResourceProfile.capital.minUsd.toLocaleString()}–$
              {(signal.estimatedResourceProfile.capital.maxUsd ?? 0).toLocaleString()})
            </span>
          )}
        </span>
        <span className="ml-auto">
          <span className="text-text-faint">Süre:</span>{" "}
          <span className="text-text">
            {signal.estimatedResourceProfile.time.weeksToMvp.min}-
            {signal.estimatedResourceProfile.time.weeksToMvp.max} hafta
          </span>
        </span>
      </div>
    </li>
  );
}
