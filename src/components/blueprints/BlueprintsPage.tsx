"use client";

import { useState } from "react";
import { blueprints, type Blueprint } from "@/lib/blueprints";
import { BlueprintCard } from "./BlueprintCard";
import { BlueprintDetail } from "./BlueprintDetail";
import { InstallDrawer } from "./InstallDrawer";
import { Rocket, Sparkles } from "lucide-react";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";

export function BlueprintsPage() {
  const [selected, setSelected] = useState<Blueprint | null>(null);
  const [installOpen, setInstallOpen] = useState(false);

  if (selected) {
    return (
      <>
        <BlueprintDetail
          blueprint={selected}
          onBack={() => setSelected(null)}
          onInstall={() => setInstallOpen(true)}
        />
        <InstallDrawer
          open={installOpen}
          blueprint={selected}
          onClose={() => setInstallOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="solar" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/4 h-48 w-[500px] rounded-full bg-ion/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/3 h-40 w-[400px] rounded-full bg-nebula/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Rocket size={12} className="text-ion" />
            The Keymaker · Blueprints
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Bir departmanı 12 dakikada kur.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-muted leading-relaxed">
            Hazır domain paketleri. Her biri eksiksiz bir departman kurar: departmanlar, ajanlar,
            skill'ler, workflow'lar ve önerilen OKR'ler. Oracle Forge motoru arkada canonical
            şablonlarla üretir. <span className="text-text">Dijital tarafı uçtan uca</span>,
            fiziksel tarafı ölçülebilir kılar.
          </p>

          <div className="mt-5 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-ion/30 bg-ion-soft px-2.5 py-1 text-ion">
              <Sparkles size={11} />
              {blueprints.length} blueprint hazır
            </span>
            <span className="font-mono text-text-muted">
              Toplam: {blueprints.reduce((s, b) => s + b.agents.length, 0)} agent ·{" "}
              {blueprints.reduce((s, b) => s + b.skills.length, 0)} skill ·{" "}
              {blueprints.reduce((s, b) => s + b.workflows.length, 0)} workflow
            </span>
          </div>
        </div>

        <div className="relative mt-6 max-w-3xl">
          <MatrixQuote speaker={MODULE_QUOTES["/blueprints"].speaker} tone={MODULE_QUOTES["/blueprints"].tone}>
            {MODULE_QUOTES["/blueprints"].line}
          </MatrixQuote>
        </div>
      </section>

      <section className="px-8 py-8">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {blueprints.map((bp) => (
            <BlueprintCard key={bp.id} blueprint={bp} onOpen={() => setSelected(bp)} />
          ))}
        </div>
      </section>
    </div>
  );
}
