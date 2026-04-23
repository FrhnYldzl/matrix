import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "ion" | "nebula" | "quantum" | "solar" | "crimson" | "neutral";

const toneClass: Record<Tone, string> = {
  ion: "bg-ion-soft text-ion border-ion/30",
  nebula: "bg-nebula-soft text-nebula border-nebula/30",
  quantum: "bg-quantum-soft text-quantum border-quantum/30",
  solar: "bg-solar-soft text-solar border-solar/30",
  crimson: "bg-crimson-soft text-crimson border-crimson/30",
  neutral: "bg-elevated text-text-muted border-border",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
