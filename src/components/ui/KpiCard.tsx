import { cn } from "@/lib/cn";
import { Card } from "./Card";
import type { ReactNode } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

type Trend = "up" | "down" | "flat";
type Tone = "ion" | "nebula" | "quantum" | "solar";

const accents: Record<Tone, string> = {
  ion: "from-ion/25 via-ion/5",
  nebula: "from-nebula/25 via-nebula/5",
  quantum: "from-quantum/25 via-quantum/5",
  solar: "from-solar/25 via-solar/5",
};

const trendColor: Record<Trend, string> = {
  up: "text-quantum",
  down: "text-crimson",
  flat: "text-text-muted",
};

export function KpiCard({
  label,
  value,
  unit,
  delta,
  trend = "flat",
  hint,
  icon,
  tone = "ion",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  trend?: Trend;
  hint?: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70",
          accents[tone]
        )}
      />
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-text-muted">{label}</span>
          {icon && <span className="text-text-muted">{icon}</span>}
        </div>
        <div className="mt-3 flex items-baseline gap-1.5 font-sans">
          <span className="text-4xl font-semibold tabular-nums tracking-tight text-text">
            {value}
          </span>
          {unit && <span className="text-sm text-text-muted">{unit}</span>}
        </div>
        {(delta || hint) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {delta && (
              <span className={cn("inline-flex items-center gap-1 font-medium", trendColor[trend])}>
                <Icon size={12} strokeWidth={2.5} />
                {delta}
              </span>
            )}
            {hint && <span className="text-text-faint">{hint}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
