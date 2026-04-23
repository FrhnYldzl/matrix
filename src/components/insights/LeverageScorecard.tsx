"use client";

import { cn } from "@/lib/cn";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { RadialProgress } from "../ui/RadialProgress";
import { Sparkline } from "../ui/Sparkline";
import { TrendingUp } from "lucide-react";

export function LeverageScorecard({
  delegatedHours,
  managementHours,
  history,
}: {
  delegatedHours: number;
  managementHours: number;
  history: number[];
}) {
  const ratio = managementHours > 0 ? delegatedHours / managementHours : 0;
  const tone =
    ratio >= 10 ? "quantum" : ratio >= 5 ? "ion" : ratio >= 3 ? "solar" : "crimson";
  const verdict =
    ratio >= 10
      ? "Ürünleşmeye hazır"
      : ratio >= 5
      ? "Güçlü kaldıraç"
      : ratio >= 3
      ? "Kabul edilebilir"
      : "Zayıf yatırım";

  // Normalize ratio → progress %
  const pct = Math.min(100, (ratio / 15) * 100);

  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5",
          tone === "quantum" && "bg-quantum/70",
          tone === "ion" && "bg-ion/70",
          tone === "solar" && "bg-solar/70",
          tone === "crimson" && "bg-crimson/70"
        )}
      />
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-ion" />
          <CardTitle>Kaldıraç Skoru</CardTitle>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          devredilen / yönetim
        </span>
      </CardHeader>
      <CardBody>
        <div className="flex items-start gap-6">
          <RadialProgress value={pct} size={132} stroke={10} tone={tone}>
            <div className="flex flex-col items-center leading-none">
              <span className="font-sans text-4xl font-semibold tabular-nums text-text">
                {ratio.toFixed(1)}
                <span className="ml-0.5 text-lg text-text-muted">x</span>
              </span>
              <span
                className={cn(
                  "mt-1 font-mono text-[10px] uppercase tracking-widest",
                  tone === "quantum" && "text-quantum",
                  tone === "ion" && "text-ion",
                  tone === "solar" && "text-solar",
                  tone === "crimson" && "text-crimson"
                )}
              >
                {verdict}
              </span>
            </div>
          </RadialProgress>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Formül</div>
              <div className="font-mono text-sm text-text">
                <span className="text-quantum">{delegatedHours.toFixed(0)} saat</span>{" "}
                <span className="text-text-faint">devredilen</span> /{" "}
                <span className="text-solar">{managementHours.toFixed(1)} saat</span>{" "}
                <span className="text-text-faint">yönetim</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Her bir yönetim saatin için sistem sana <b className={cn(
                  tone === "quantum" && "text-quantum",
                  tone === "ion" && "text-ion",
                  tone === "solar" && "text-solar",
                  tone === "crimson" && "text-crimson"
                )}>{ratio.toFixed(1)}</b> saat değerinde iş üretiyor. Hedef bölgesi: 3x–10x.
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-text-faint">
                <span>12 hafta önce</span>
                <span>şimdi</span>
              </div>
              <Sparkline
                data={history}
                tone={tone}
                width={420}
                height={52}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
