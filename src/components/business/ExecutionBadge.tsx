"use client";

import { cn } from "@/lib/cn";
import type { ExecutionType } from "@/lib/business-library";
import { Globe, MapPin, Package } from "lucide-react";

const meta: Record<
  ExecutionType,
  { label: string; icon: typeof Globe; cls: string; dot: string }
> = {
  "digital-only": {
    label: "100% Dijital",
    icon: Globe,
    cls: "text-ion border-ion/40 bg-ion-soft",
    dot: "bg-ion",
  },
  hybrid: {
    label: "Hibrit",
    icon: Package,
    cls: "text-nebula border-nebula/40 bg-nebula-soft",
    dot: "bg-nebula",
  },
  "physical-heavy": {
    label: "Fiziksel Ağırlıklı",
    icon: MapPin,
    cls: "text-solar border-solar/40 bg-solar-soft",
    dot: "bg-solar",
  },
};

export function ExecutionBadge({
  type,
  digitalShare,
  compact = false,
}: {
  type: ExecutionType;
  digitalShare?: number;
  compact?: boolean;
}) {
  const m = meta[type];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        m.cls
      )}
    >
      <Icon size={10} />
      {m.label}
      {!compact && digitalShare != null && (
        <span className="font-mono opacity-80">· %{digitalShare}</span>
      )}
    </span>
  );
}

// Coloured chip used inside task lists — shows whether a task is digital/physical
export function TaskKind({ kind }: { kind: "digital" | "physical" }) {
  if (kind === "physical") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-solar/30 bg-solar-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-solar">
        <MapPin size={9} /> fiziksel
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-ion/30 bg-ion-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ion">
      <Globe size={9} /> dijital
    </span>
  );
}
