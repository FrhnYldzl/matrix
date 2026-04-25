"use client";

import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { OracleStream } from "@/components/oracle/OracleStream";
import { Zap } from "lucide-react";

/**
 * /workspace/[id]/operations — The Bridge
 *
 * Day-to-day çalıştırma:
 *   • The Operator (tasks)
 *   • Prime Program (rituals)
 *   • Captain's Log (Traction · Rocks · Scorecard · Issues · L10)
 *   • Nebuchadnezzar (Control · approvals · audit · kill switch)
 *   • The Loading Program (running workflows)
 *   • KPI Row + Activity Feed
 *
 * Sprint A'da: OracleStream + breadcrumb-style modül listesi (clickable,
 * mevcut /operator /prime /traction /control /workflows route'larına
 * yönlendirir — tam entegrasyon Sprint B'de).
 */
export default function OperationsTab() {
  const params = useParams<{ id: string }>();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const ws = workspaces.find((w) => w.id === params.id);

  if (!ws) return null;

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            <Zap size={12} className="text-ion" />
            The Bridge · day-to-day çalıştırma
          </div>
          <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-text">
            {ws.name} · canlı operasyon
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Görevler · ritüeller · onaylar · workflow akışları — bu varlığın
            günlük nabzı.
          </p>
        </header>

        {/* Oracle Stream — bugünkü aksiyonlar */}
        <OracleStream />

        {/* Modül grid — Sprint B'de zenginleşecek, şimdilik clickable kart */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ModuleCard
            href="/operator"
            title="The Operator"
            subtitle="Task Board"
            description="todo · doing · review · done · blocked"
            color="ion"
          />
          <ModuleCard
            href="/prime"
            title="Prime Program"
            subtitle="Rituals"
            description="L10 · weekly review · deep work"
            color="nebula"
          />
          <ModuleCard
            href="/traction"
            title="Captain's Log"
            subtitle="EOS · Traction"
            description="Rocks · Scorecard · Issues · L10"
            color="nebula"
          />
          <ModuleCard
            href="/control"
            title="Nebuchadnezzar"
            subtitle="Control Room"
            description="Approvals · audit · kill switch"
            color="solar"
          />
          <ModuleCard
            href="/workflows"
            title="Loading Program"
            subtitle="Workflow Canvas"
            description="Çalışan otomasyonlar"
            color="quantum"
          />
        </div>

        <div className="rounded-lg border border-dashed border-border/60 bg-elevated/20 p-4 text-center">
          <p className="text-xs text-text-muted">
            Sprint B&apos;de bu modüllerin tümü tek ekranda zengin görünüm
            olarak görüntülenecek. Şimdilik kartlara tıklayarak ilgili
            sayfalara gidebilirsin.
          </p>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  href,
  title,
  subtitle,
  description,
  color,
}: {
  href: string;
  title: string;
  subtitle: string;
  description: string;
  color: "ion" | "nebula" | "quantum" | "solar";
}) {
  const colorMap: Record<typeof color, string> = {
    ion: "border-ion/30 bg-ion-soft/15 text-ion hover:bg-ion-soft/25",
    nebula:
      "border-nebula/30 bg-nebula-soft/15 text-nebula hover:bg-nebula-soft/25",
    quantum:
      "border-quantum/30 bg-quantum-soft/15 text-quantum hover:bg-quantum-soft/25",
    solar: "border-solar/30 bg-solar-soft/15 text-solar hover:bg-solar-soft/25",
  };
  return (
    <a
      href={href}
      className={`block rounded-xl border p-4 transition-all hover:scale-[1.01] ${colorMap[color]}`}
    >
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">
        {subtitle}
      </div>
      <div className="mt-1 text-base font-semibold text-text">{title}</div>
      <div className="mt-1 text-xs text-text-muted">{description}</div>
    </a>
  );
}
